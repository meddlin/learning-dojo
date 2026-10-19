// Sanity-checks the whole curriculum, for every language whose toolchain is installed:
//   * every starter must compile and FAIL its tests (a starter that already
//     passes teaches nothing);
//   * every reference solution must compile and PASS all tests;
//   * the scratch main() in both must build, and the reference one must run.
//
// Usage: npm run verify [-- --lang cpp|go] [<id-prefix> ...]
// Set CXX / GO to choose a compiler.

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Pin the Go module language version, so exercises only use Go 1.22 features.
process.env.DOJO_GO_LANG = '1.22';

import { Catalogs } from '../src/core/catalog';
import { stripAnsi } from '../src/core/diagnostics';
import { LANGUAGE_IDS, LANGUAGES, isLanguageId } from '../src/core/languages';
import { cleanupBinary, EXE } from '../src/core/runner';
import { BACKENDS, DEFAULT_SETTINGS } from '../src/core/toolchain';
import type { LanguageId } from '../src/core/types';

const catalogs = new Catalogs(path.resolve(__dirname, '..', 'languages'));

/** Returns the number of exercises with problems, or null when the language's toolchain is missing. */
async function verifyLanguage(lang: LanguageId, prefixes: string[]): Promise<number | null> {
  const backend = BACKENDS[lang];
  const catalog = catalogs.get(lang);
  const pack = LANGUAGES[lang];
  const tc = await backend.detect({ ...DEFAULT_SETTINGS, compiler: process.env.CXX ?? '', goPath: process.env.GO ?? '' });
  if (!tc.cmd) return null;
  console.log(`== ${pack.label}: ${tc.version} (${backend.describe(tc)})\n`);

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-verify-'));
  const buildDir = path.join(tmp, 'build');
  let problems = 0;
  const exercises = catalog.all().filter((e) => !prefixes.length || prefixes.some((p) => e.id.startsWith(p)));

  for (const ex of exercises) {
    const issues: string[] = [];
    for (const f of ['exercise.json', 'prompt.md', pack.starterFile, pack.testFile]) {
      if (!fs.existsSync(path.join(ex.dir, f))) issues.push(`missing ${f}`);
    }
    if (ex.hints.length < 3) issues.push(`has ${ex.hints.length} hints (want at least 3)`);
    const refDir = catalog.referenceDir(ex);
    if (!fs.existsSync(path.join(refDir, pack.solutionFile))) issues.push(`missing reference/${ex.id}/${pack.solutionFile}`);
    if (catalog.testNames(ex).length === 0) issues.push(`${pack.testFile} has no test cases`);

    if (!issues.length) {
      const starterDir = path.join(tmp, ex.id);
      fs.mkdirSync(starterDir, { recursive: true });
      fs.copyFileSync(path.join(ex.dir, pack.starterFile), path.join(starterDir, pack.solutionFile));
      const common = { tc, testFile: catalog.testFile(ex), includeDir: catalog.includeDir, buildDir, color: false };

      const s = await backend.runTests({ ...common, solutionDir: starterDir, tag: `${ex.id}-starter` });
      if (!s.compiled) issues.push(`starter does not compile:\n${s.output}`);
      else if (s.passedAll) issues.push('starter already passes every test');
      else if (s.timedOut) issues.push('starter times out (stubs should return immediately)');

      const r = await backend.runTests({ ...common, solutionDir: refDir, tag: `${ex.id}-reference` });
      if (!r.compiled) issues.push(`reference does not compile:\n${r.output}`);
      else if (!r.passedAll) issues.push(`reference fails its tests:\n${r.output}`);

      for (const [label, dir, mustExit0] of [
        ['starter', starterDir, false],
        ['reference', refDir, true],
      ] as const) {
        const out = path.join(buildDir, `${ex.id}-${label}-run${EXE}`);
        const b = await backend.build({ tc, kind: 'run', solutionDir: dir, includeDir: catalog.includeDir, outFile: out, color: false });
        if (!b.ok) issues.push(`${label} main does not compile:\n${b.output}`);
        else if (mustExit0) {
          const run = spawnSync(out, [], { timeout: 10_000, encoding: 'utf8' });
          if (run.status !== 0) issues.push(`reference main exited with ${run.status}:\n${run.stdout}${run.stderr}`);
        }
        cleanupBinary(out);
      }
    }

    console.log(`[${issues.length ? 'FAIL' : ' ok '}] ${ex.id}`);
    for (const i of issues) console.log(`       ${stripAnsi(i).replace(/\n/g, '\n       ')}`);
    problems += issues.length ? 1 : 0;
  }

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${exercises.length - problems} of ${exercises.length} ${pack.label} exercises verified.\n`);
  return problems;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let only: LanguageId | null = null;
  const li = args.indexOf('--lang');
  if (li >= 0) {
    const wanted = args[li + 1];
    args.splice(li, 2);
    if (!isLanguageId(wanted)) {
      console.error(`Unknown language "${wanted}". Choose one of: ${LANGUAGE_IDS.join(', ')}.`);
      process.exit(2);
    }
    only = wanted;
  }
  let problems = 0;
  for (const lang of LANGUAGE_IDS) {
    if (only && lang !== only) continue;
    const result = await verifyLanguage(lang, args);
    if (result === null) {
      console.error(`${LANGUAGES[lang].label}: no toolchain found${only ? '' : ', skipped'}.\n`);
      if (only) process.exit(2);
    } else {
      problems += result;
    }
  }
  process.exit(problems ? 1 : 0);
}

void main();
