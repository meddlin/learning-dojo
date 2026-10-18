#!/usr/bin/env node
'use strict';
// Sanity-checks the whole curriculum:
//   * every starter file must compile, and must FAIL its tests (an exercise whose
//     starter already passes teaches nothing);
//   * every reference solution must compile and PASS all tests;
//   * the scratch `main` in both must compile and run.
//
// Usage: node scripts/verify.js [--lang cpp|go] [id-prefix ...]
// Without --lang every language whose toolchain is installed is checked.

const fs = require('fs');
const os = require('os');
const path = require('path');
// Pin the Go module language version before the Go runner loads, so exercises
// only use Go 1.22 features.
process.env.DOJO_GO_LANG = '1.22';

const curriculum = require('../server/lib/curriculum');
const { LANGUAGES, getLanguage } = require('../server/languages');
const stripAnsi = (s) => String(s).replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');

function runJob(Job, opts) {
  return new Promise((resolve) => {
    const job = new Job(opts);
    let output = '';
    job.on('out', (d) => {
      output += d;
    });
    job.on('done', (summary) => resolve({ summary, output }));
    job.start();
  });
}

function passedAll(summary) {
  const r = summary.results;
  return Boolean(summary.compiled && r && r.total > 0 && r.failed === 0 && summary.exitCode === 0 && !summary.timedOut);
}

async function verifyLanguage(language, filters) {
  const runner = language.runner();
  const lib = curriculum.forLanguage(language);
  const { Job } = runner;
  const tc = runner.getToolchain();
  if (!tc.cmd) return null;
  const detail = language.id === 'go' ? `race detector ${tc.race ? 'on' : 'off'}` : `${tc.std}, sanitizers ${tc.sanitizers ? 'on' : 'off'}`;
  console.log(`== ${language.label}: ${tc.version} (${detail})\n`);

  const exercises = lib.allExercises().filter((e) => !filters.length || filters.some((f) => e.id.startsWith(f)));
  let problems = 0;
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-verify-'));

  for (const ex of exercises) {
    const issues = [];
    const refDir = lib.referenceDir(ex);
    const hasRef = fs.existsSync(path.join(refDir, language.solutionFile));
    for (const f of ['exercise.json', 'prompt.md', language.starterFile, language.testFile]) {
      if (!fs.existsSync(path.join(ex.dir, f))) issues.push(`missing ${f}`);
    }
    if (ex.hints.length < 3) issues.push(`has ${ex.hints.length} hints (want at least 3)`);
    if (!hasRef) issues.push(`missing reference/${language.solutionFile}`);

    if (!issues.length) {
      // Starter: compiles, fails the tests.
      const starterDir = path.join(tmpRoot, ex.id);
      fs.mkdirSync(starterDir, { recursive: true });
      fs.copyFileSync(path.join(ex.dir, language.starterFile), path.join(starterDir, language.solutionFile));
      const s = await runJob(Job, { mode: 'test', workDir: starterDir, exerciseDir: ex.dir });
      if (!s.summary.compiled) issues.push(`starter does not compile:\n${s.output}`);
      else if (passedAll(s.summary)) issues.push('starter already passes every test');
      else if (s.summary.timedOut) issues.push('starter times out (stubs should return immediately)');

      // Reference: compiles and passes.
      const r = await runJob(Job, { mode: 'test', workDir: refDir, exerciseDir: ex.dir });
      if (!r.summary.compiled) issues.push(`reference does not compile:\n${r.output}`);
      else if (!passedAll(r.summary)) issues.push(`reference fails its tests:\n${r.output}`);

      // Scratch mains build and run.
      const sr = await runJob(Job, { mode: 'run', workDir: starterDir, exerciseDir: ex.dir });
      if (!sr.summary.compiled) issues.push(`starter main does not compile:\n${sr.output}`);
      const rr = await runJob(Job, { mode: 'run', workDir: refDir, exerciseDir: ex.dir });
      if (!rr.summary.compiled) issues.push(`reference main does not compile:\n${rr.output}`);
      else if (rr.summary.exitCode !== 0) issues.push(`reference main exited with ${rr.summary.exitCode}:\n${rr.output}`);
    }

    const tag = issues.length ? 'FAIL' : ' ok ';
    console.log(`[${tag}] ${ex.id}`);
    for (const i of issues) console.log(`       ${stripAnsi(i).replace(/\n/g, '\n       ')}`);
    problems += issues.length ? 1 : 0;
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  console.log(`\n${exercises.length - problems} of ${exercises.length} ${language.label} exercises verified.\n`);
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  let only = null;
  const li = args.indexOf('--lang');
  if (li >= 0) {
    only = args[li + 1];
    args.splice(li, 2);
    if (!getLanguage(only)) {
      console.error(`Unknown language "${only}". Choose one of: ${Object.keys(LANGUAGES).join(', ')}.`);
      process.exit(2);
    }
  }
  let problems = 0;
  for (const language of Object.values(LANGUAGES)) {
    if (only && language.id !== only) continue;
    const result = await verifyLanguage(language, args);
    if (result === null) {
      console.error(`${language.label}: no toolchain found${only ? '' : ', skipped'}.\n`);
      if (only) process.exit(2);
    } else {
      problems += result;
    }
  }
  process.exit(problems ? 1 : 0);
}

main();
