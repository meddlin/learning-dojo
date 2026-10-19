// Builds and runs Go exercises. Every job gets its own throw-away module with your
// solution.go (plus, for tests, the exercise's solution_test.go and the shared
// dojo_test.go helpers). Tests are compiled once with `go test -c`; if a test panics,
// deadlocks or hangs, it is reported as failed and the tests that had not run yet are
// started again in a fresh process, so one broken test never hides the rest.

import { spawn, type ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec } from './exec';
import { goTestNames, parseTestRun, prettyName, testMessage } from './goOutput';
import { kill, MAX_OUTPUT_BYTES, type BuildRequest, type BuildResult, type TestRunOptions, type TestRunSummary } from './runner';
import type { TestOutcome, ToolchainInfo } from './types';

export const MIN_GO_MINOR = 22; // loop-variable semantics, range over int
const PER_TEST_TIMEOUT_MS = 8_000;
const AFTER_HANG_TIMEOUT_MS = 3_000; // once one test has hung, give the others less rope
const NONE: ToolchainInfo = { cmd: null, version: null, std: null, checks: false };

export const GO_MISSING_HELP =
  'No Go toolchain found. Install Go 1.22 or newer from https://go.dev/dl/ (or: brew install go), then run "Dojo: Refresh". Or set "dojo.go.path" to your go binary.';

/** Environment for every go command: never download toolchains, never touch the learner's modules. */
function goEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return { ...process.env, GOTOOLCHAIN: 'local', GOFLAGS: '-buildvcs=false', GO111MODULE: 'on', GOWORK: 'off', ...extra };
}

/**
 * The module's language version decides which features the compiler allows. Learners get
 * everything their toolchain offers; `npm run verify` pins 1.22 (via DOJO_GO_LANG) so the
 * curriculum itself never needs anything newer than the minimum.
 */
function writeModule(dir: string, lang: string): void {
  fs.writeFileSync(path.join(dir, 'go.mod'), `module dojo\n\ngo ${process.env.DOJO_GO_LANG || lang}\n`);
}

/** Can this machine build and run a program with the race detector? (It needs cgo.) */
async function probeRace(cmd: string): Promise<boolean> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-probe-'));
  try {
    writeModule(dir, `1.${MIN_GO_MINOR}`);
    fs.writeFileSync(path.join(dir, 'p.go'), 'package main\n\nfunc main() {}\n');
    const out = path.join(dir, process.platform === 'win32' ? 'p.exe' : 'p');
    const built = await exec(cmd, ['build', '-race', '-o', out, '.'], 180_000, goEnv(), dir);
    if (built.code !== 0) return false;
    return (await exec(out, [], 10_000)).code === 0;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function candidateCommands(preferred: string): string[] {
  const home = os.homedir();
  const exe = process.platform === 'win32' ? '.exe' : '';
  const list = [
    preferred,
    process.env.GO,
    process.env.GOROOT ? path.join(process.env.GOROOT, 'bin', `go${exe}`) : '',
    'go',
    '/usr/local/go/bin/go',
    '/opt/homebrew/bin/go',
    '/usr/lib/go/bin/go',
    path.join(home, 'go', 'bin', `go${exe}`),
    path.join(home, 'sdk', 'go', 'bin', `go${exe}`),
    ...(process.platform === 'win32' ? ['C:\\Program Files\\Go\\bin\\go.exe'] : []),
  ];
  return [...new Set(list.filter((c): c is string => Boolean(c && c.trim())))];
}

/** Finds a Go toolchain new enough for the curriculum and checks for the race detector. */
export async function detectGo(preferred = '', useRace = true): Promise<ToolchainInfo> {
  let tooOld: string | undefined;
  for (const cmd of candidateCommands(preferred)) {
    const v = await exec(cmd, ['version'], 10_000, goEnv());
    if (v.code !== 0) continue;
    const m = v.stdout.match(/go version go(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!m) continue;
    if (Number(m[1]) < 1 || (Number(m[1]) === 1 && Number(m[2]) < MIN_GO_MINOR)) {
      tooOld = v.stdout.trim();
      continue;
    }
    return {
      cmd,
      version: v.stdout.trim(),
      std: `go ${m[1]}.${m[2]}`,
      goLang: `${m[1]}.${m[2]}`,
      checks: useRace && (await probeRace(cmd)),
    };
  }
  return tooOld ? { ...NONE, tooOld } : NONE;
}

export function describeGo(tc: ToolchainInfo): string {
  if (!tc.cmd) return tc.tooOld ? `${tc.tooOld.replace(/^go version /, '')} is too old (need 1.${MIN_GO_MINOR}+)` : 'no Go toolchain found';
  return `${tc.std}${tc.checks ? ' · race detector' : ''}`;
}

/** Creates the throw-away module for one job and returns its (real) path. */
function makeModule(parent: string, name: string, tc: ToolchainInfo): string {
  const dir = path.join(parent, name);
  fs.mkdirSync(dir, { recursive: true });
  const real = fs.realpathSync(dir);
  writeModule(real, tc.goLang ?? `1.${MIN_GO_MINOR}`);
  return real;
}

/** Runs one process, streaming its stdout and stderr to `onData`. */
function runProcess(cmd: string, args: string[], opts: { cwd: string; env: NodeJS.ProcessEnv }, onData: (d: Buffer) => void, onChild: (c: ChildProcess) => void): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { ...opts, windowsHide: true });
    onChild(child);
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.stdin.on('error', () => undefined);
    child.on('error', (e) => {
      onData(Buffer.from(`Could not start ${path.basename(cmd)}: ${e.message}\n`));
      resolve({ code: -1, signal: null });
    });
    child.on('close', (code, signal) => resolve({ code, signal }));
  });
}

const stripPackageHeader = (text: string) => text.replace(/^# dojo( \[dojo\.test\])?\n/m, '');

/** Builds the learner's solution.go into a runnable program (`kind: 'run'`). */
export async function buildGo(req: BuildRequest): Promise<BuildResult> {
  const { tc } = req;
  if (!tc.cmd) throw new Error('No Go toolchain');
  fs.mkdirSync(path.dirname(req.outFile), { recursive: true });
  let output = '';
  const emit = (t: string) => {
    output += t;
    req.onOutput?.(t);
  };
  const dir = makeModule(path.dirname(req.outFile), `${path.basename(req.outFile)}.mod`, tc);
  let child: ChildProcess | null = null;
  let cancelled = false;
  const onAbort = () => {
    cancelled = true;
    if (child) kill(child);
  };
  try {
    fs.copyFileSync(path.join(req.solutionDir, 'solution.go'), path.join(dir, 'solution.go'));
    if (req.signal) {
      if (req.signal.aborted) onAbort();
      else req.signal.addEventListener('abort', onAbort, { once: true });
    }
    emit(`$ go build${tc.checks ? ' -race' : ''}  (solution.go)\n`);
    const { code } = await runProcess(
      tc.cmd,
      ['build', ...(tc.checks ? ['-race'] : []), '-gcflags=-e', '-o', req.outFile, '.'],
      { cwd: dir, env: goEnv() },
      (d) => emit(stripPackageHeader(d.toString())),
      (c) => (child = c),
    );
    return { ok: code === 0 && !cancelled, cancelled, output };
  } catch (e) {
    emit(`Could not prepare the build: ${(e as Error).message}\n`);
    return { ok: false, cancelled, output };
  } finally {
    req.signal?.removeEventListener('abort', onAbort);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export async function runGoTests(opts: TestRunOptions): Promise<TestRunSummary> {
  const { tc } = opts;
  let output = '';
  const emit = (t: string) => {
    output += t;
    opts.onOutput?.(t);
  };
  const paint = (code: string, text: string) => (opts.color ? `\x1b[${code}m${text}\x1b[0m` : text);
  const summary = (extra: Partial<TestRunSummary>): TestRunSummary => ({
    compiled: false,
    cancelled: false,
    timedOut: false,
    exitCode: null,
    signal: null,
    durationMs: 0,
    results: null,
    passedAll: false,
    output,
    ...extra,
  });
  if (!tc.cmd) throw new Error('No Go toolchain');

  let dir = '';
  let child: ChildProcess | null = null;
  let userStopped = false;
  const onAbort = () => {
    userStopped = true;
    if (child) kill(child);
  };
  const binaryOf = () => path.join(dir, 'tests.bin');

  try {
    fs.mkdirSync(opts.buildDir, { recursive: true });
    dir = makeModule(opts.buildDir, `${opts.tag}-gomod`, tc);
    fs.copyFileSync(path.join(opts.solutionDir, 'solution.go'), path.join(dir, 'solution.go'));
    fs.copyFileSync(opts.testFile, path.join(dir, 'solution_test.go'));
    fs.copyFileSync(path.join(opts.includeDir, 'dojo_test.go'), path.join(dir, 'dojo_test.go'));
    if (opts.signal) {
      if (opts.signal.aborted) onAbort();
      else opts.signal.addEventListener('abort', onAbort, { once: true });
    }

    emit(`$ go test -c${tc.checks ? ' -race' : ''}  (solution.go + solution_test.go)\n`);
    const built = await runProcess(
      tc.cmd,
      ['test', '-c', ...(tc.checks ? ['-race'] : []), '-gcflags=-e', '-o', binaryOf(), '.'],
      { cwd: dir, env: goEnv() },
      (d) => emit(stripPackageHeader(d.toString())),
      (c) => (child = c),
    );
    if (userStopped) return summary({ cancelled: true });
    if (built.code !== 0) return summary({});

    const started = Date.now();
    const names = goTestNames(fs.readFileSync(path.join(dir, 'solution_test.go'), 'utf8'));
    if (names.length === 0) {
      emit(`${paint('31', 'No tests found.')}\n`);
      return summary({ compiled: true, exitCode: 1, durationMs: Date.now() - started });
    }

    const env = goEnv({ GORACE: 'halt_on_error=1' });
    const results = new Map<string, { ok: boolean; message: string }>();
    let timedOut = false;
    const record = (name: string, ok: boolean, message: string) => {
      results.set(name, { ok, message });
      const shown = prettyName(name);
      emit(`${paint('2', '[ RUN  ]')} ${shown}\n`);
      emit(ok ? `${paint('32', '[ PASS ]')} ${shown}\n` : `${paint('31', '[ FAIL ]')} ${shown}\n${message}\n`);
    };
    const indent = (text: string) => text.split('\n').map((l) => (l.startsWith('    ') ? l : `    ${l}`)).join('\n');

    let remaining = names.slice();
    while (remaining.length && !userStopped) {
      const subset = remaining.length === names.length ? [] : remaining;
      const stallMs = timedOut ? AFTER_HANG_TIMEOUT_MS : (opts.timeoutMs ?? PER_TEST_TIMEOUT_MS);
      const run = await runTestProcess(binaryOf(), env, dir, subset, stallMs, (c) => (child = c));
      const parsed = parseTestRun(run.output);
      const before = results.size;

      for (const t of parsed.done) {
        if (!results.has(t.name)) record(t.name, t.ok, t.ok ? '' : testMessage(t.lines.join('\n'), dir));
      }
      if (parsed.crashed?.name && !results.has(parsed.crashed.name)) {
        let message: string;
        if (run.stalled) {
          timedOut = true;
          message = `    timed out after ${stallMs / 1000}s: is there an infinite loop, or a goroutine waiting forever?`;
        } else if (userStopped) {
          message = '    stopped';
        } else {
          message = testMessage(parsed.crashed.lines.join('\n'), dir);
          if (run.signal) message += `\n    the test process crashed (${run.signal})`;
          else if (!message) message = `    the test process exited with code ${run.code}`;
          message = indent(message);
        }
        record(parsed.crashed.name, false, message);
      }
      remaining = remaining.filter((n) => !results.has(n));
      if (results.size === before && remaining.length && !userStopped) {
        // No progress: the process died before reaching any test. Do not loop forever.
        const detail = testMessage(run.output, dir) || `the test process exited with code ${run.code}`;
        for (const n of remaining) record(n, false, indent(`the test process stopped before this test ran\n${detail}`));
        remaining = [];
      }
    }

    const tests: TestOutcome[] = names.filter((n) => results.has(n)).map((n) => ({ name: prettyName(n), ok: results.get(n)!.ok, message: results.get(n)!.message }));
    const passed = tests.filter((t) => t.ok).length;
    const failed = names.length - passed;
    emit(`\n${paint(failed ? '31' : '32', `${passed} of ${names.length} tests passed`)}\n`);
    return summary({
      compiled: true,
      cancelled: userStopped,
      timedOut,
      exitCode: failed || tests.length < names.length ? 1 : 0,
      durationMs: Date.now() - started,
      results: { passed, failed, total: names.length, tests },
      passedAll: !userStopped && !timedOut && failed === 0 && tests.length === names.length,
    });
  } catch (e) {
    emit(`Could not prepare the build: ${(e as Error).message}\n`);
    return summary({});
  } finally {
    opts.signal?.removeEventListener('abort', onAbort);
    if (dir) fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** One run of the test binary. An empty `subset` means "all tests". A run that makes no progress for `stallMs` is killed. */
function runTestProcess(
  binary: string,
  env: NodeJS.ProcessEnv,
  cwd: string,
  subset: string[],
  stallMs: number,
  onChild: (c: ChildProcess) => void,
): Promise<{ output: string; code: number | null; signal: NodeJS.Signals | null; stalled: boolean }> {
  return new Promise((resolve) => {
    const args = ['-test.v', '-test.count=1'];
    if (subset.length) args.push(`-test.run=^(${subset.join('|')})$`);
    const proc = spawn(binary, args, { cwd, env, windowsHide: true });
    onChild(proc);
    proc.stdin.on('error', () => undefined);
    proc.stdin.end();
    let output = '';
    let stalled = false;
    let timer: NodeJS.Timeout | undefined;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        stalled = true;
        kill(proc);
      }, stallMs);
    };
    arm();
    const onData = (d: Buffer) => {
      const text = d.toString();
      if (output.length < MAX_OUTPUT_BYTES) output += text;
      if (/^(=== RUN|--- )/m.test(text)) arm(); // a test started or finished: still alive
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', () => {
      clearTimeout(timer);
      resolve({ output, code: -1, signal: null, stalled });
    });
    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ output, code, signal, stalled });
    });
  });
}
