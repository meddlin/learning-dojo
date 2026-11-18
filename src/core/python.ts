// Runs Python exercises. There is nothing to compile: "building" is a syntax check, and
// the tests run through include/dojo_runner.py, which imports the learner's solution.py
// via the exercise's test_solution.py and reports one event per test on stdout. If a
// test hangs or the interpreter dies, that test is reported as failed and the tests that
// had not run yet are started again in a fresh process, as the Go runner does.

import { spawn, type ChildProcess } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from './exec';
import { kill, MAX_OUTPUT_BYTES, type BuildRequest, type BuildResult, type TestRunOptions, type TestRunSummary } from './runner';
import type { TestOutcome, ToolchainInfo } from './types';

export const MIN_PYTHON: [number, number] = [3, 10]; // match statements, `X | Y` type hints
const PER_TEST_TIMEOUT_MS = 8_000;
const AFTER_HANG_TIMEOUT_MS = 3_000;
/** Importing pandas for the first time after an install can take a while. */
const STARTUP_TIMEOUT_MS = 30_000;
const NONE: ToolchainInfo = { cmd: null, version: null, std: null, checks: false };
export const RUNNER_FILE = 'dojo_runner.py';
const PREFIX = '\x1edojo ';

export const PYTHON_MISSING_HELP =
  'No Python found. Install Python 3.10 or newer from https://www.python.org/downloads/ (or: brew install python), then run "Dojo: Refresh". Or set "dojo.python.path" to your python binary, for example a virtual environment\'s.';

/** Environment for every python process: unbuffered UTF-8 output, and no __pycache__ in the learner's folder. */
export function pythonEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8', ...extra };
}

const PROBE = [
  'import json, sys',
  'try:',
  '    import pandas',
  '    pd = pandas.__version__',
  'except Exception:',
  '    pd = None',
  'print(json.dumps({"v": list(sys.version_info[:3]), "exe": sys.executable, "pandas": pd}))',
].join('\n');

function candidateCommands(preferred: string): string[] {
  const win = process.platform === 'win32';
  const inEnv = (dir: string | undefined) => (dir ? path.join(dir, win ? 'Scripts' : 'bin', win ? 'python.exe' : 'python') : '');
  const list = [
    preferred,
    process.env.PYTHON,
    inEnv(process.env.VIRTUAL_ENV),
    process.env.CONDA_PREFIX ? (win ? path.join(process.env.CONDA_PREFIX, 'python.exe') : path.join(process.env.CONDA_PREFIX, 'bin', 'python')) : '',
    inEnv(path.join(os.homedir(), '.dojo-venv')),
    'python3',
    'python',
    '/opt/homebrew/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python3',
  ];
  return [...new Set(list.filter((c): c is string => Boolean(c && c.trim())))];
}

interface Probe {
  cmd: string;
  version: [number, number, number];
  pandas: string | null;
}

async function probe(cmd: string): Promise<Probe | null> {
  const r = await exec(cmd, ['-c', PROBE], 20_000, pythonEnv());
  if (r.code !== 0) return null;
  try {
    const j = JSON.parse(r.stdout.trim().split('\n').pop() ?? '') as { v: [number, number, number]; exe: string; pandas: string | null };
    return { cmd: j.exe || cmd, version: j.v, pandas: j.pandas };
  } catch {
    return null;
  }
}

const newEnough = (v: [number, number, number]) => v[0] > MIN_PYTHON[0] || (v[0] === MIN_PYTHON[0] && v[1] >= MIN_PYTHON[1]);

/**
 * Finds a Python 3.10+. The user's setting wins when it works; otherwise the first
 * interpreter that has pandas is preferred, so the pandas track works out of the box.
 */
export async function detectPython(preferred = ''): Promise<ToolchainInfo> {
  let tooOld: string | undefined;
  let fallback: Probe | null = null;
  const seen = new Set<string>();
  for (const cmd of candidateCommands(preferred)) {
    const p = await probe(cmd);
    if (!p || seen.has(p.cmd)) continue;
    seen.add(p.cmd);
    if (!newEnough(p.version)) {
      tooOld = tooOld ?? `Python ${p.version.join('.')} (${p.cmd})`;
      continue;
    }
    if (p.pandas || cmd === preferred) return info(p);
    fallback = fallback ?? p;
  }
  if (fallback) return info(fallback);
  return tooOld ? { ...NONE, tooOld } : NONE;
}

function info(p: Probe): ToolchainInfo {
  return {
    cmd: p.cmd,
    version: `Python ${p.version.join('.')}`,
    std: `python ${p.version[0]}.${p.version[1]}`,
    checks: false,
    pandas: p.pandas ?? undefined,
  };
}

export function describePython(tc: ToolchainInfo): string {
  if (!tc.cmd) return tc.tooOld ? `${tc.tooOld} is too old (need ${MIN_PYTHON.join('.')}+)` : 'no Python found';
  return `${tc.std} · ${tc.pandas ? `pandas ${tc.pandas}` : 'no pandas'}`;
}

export function pythonMissingHelp(tc: ToolchainInfo): string {
  if (tc.tooOld) return `Found ${tc.tooOld}, but Learning Dojo needs Python ${MIN_PYTHON.join('.')} or newer. Install a newer Python, or set "dojo.python.path".`;
  return PYTHON_MISSING_HELP;
}

/** Checks solution.py for syntax errors; the program itself runs as `python solution.py` in a terminal. */
export async function buildPython(req: BuildRequest): Promise<BuildResult> {
  const { tc } = req;
  if (!tc.cmd) throw new Error('No Python');
  const file = path.join(req.solutionDir, 'solution.py');
  let output = '$ python -m py_compile solution.py\n';
  req.onOutput?.(output);
  const r = await exec(tc.cmd, ['-B', path.join(req.includeDir, RUNNER_FILE), '--check', file], 30_000, pythonEnv());
  const text = `${r.stdout}${r.stderr}`;
  output += text;
  if (text) req.onOutput?.(text);
  const cancelled = Boolean(req.signal?.aborted);
  return { ok: r.code === 0 && !cancelled, cancelled, output, command: { path: tc.cmd, args: ['-u', file] } };
}

// ---- the test protocol ----------------------------------------------------------

export type RunnerEvent =
  | { e: 'error'; message: string }
  | { e: 'start'; tests: string[] }
  | { e: 'run'; name: string }
  | { e: 'done'; name: string; ok: boolean; message: string }
  | { e: 'end' };

/** Splits the runner's stdout into events. Lines without the prefix are ignored. */
export function parseEvents(text: string): RunnerEvent[] {
  const out: RunnerEvent[] = [];
  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf(PREFIX);
    if (i < 0) continue;
    try {
      out.push(JSON.parse(line.slice(i + PREFIX.length)) as RunnerEvent);
    } catch {
      /* a partial or mangled line: ignore it */
    }
  }
  return out;
}

/** Names of the test functions in a test_solution.py, in source order. */
export function pythonTestNames(source: string): string[] {
  return [...source.matchAll(/^def (test_\w+)\s*\(/gm)].map((m) => m[1]);
}

/** "test_word_count_ignores_case" -> "word count ignores case" */
export function pythonPrettyName(name: string): string {
  return name.replace(/^test_?/, '').replace(/_+/g, ' ').trim();
}

interface ProcessRun {
  events: RunnerEvent[];
  code: number | null;
  signal: NodeJS.Signals | null;
  stalled: boolean;
  /** Stopped for printing more than MAX_OUTPUT_BYTES. */
  flooded: boolean;
}

export async function runPythonTests(opts: TestRunOptions): Promise<TestRunSummary> {
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
  if (!tc.cmd) throw new Error('No Python');

  let child: ChildProcess | null = null;
  let userStopped = false;
  const onAbort = () => {
    userStopped = true;
    if (child) kill(child);
  };

  try {
    const names = pythonTestNames(fs.readFileSync(opts.testFile, 'utf8'));
    if (opts.signal) {
      if (opts.signal.aborted) onAbort();
      else opts.signal.addEventListener('abort', onAbort, { once: true });
    }
    emit(`$ python dojo_runner.py  (solution.py + test_solution.py)\n`);
    const started = Date.now();
    if (names.length === 0) {
      emit(`${paint('31', 'No tests found.')}\n`);
      return summary({ compiled: true, exitCode: 1 });
    }

    const results = new Map<string, { ok: boolean; message: string }>();
    let timedOut = false;
    const record = (name: string, ok: boolean, message: string) => {
      results.set(name, { ok, message });
      const shown = pythonPrettyName(name);
      emit(ok ? `${paint('32', '[ PASS ]')} ${shown}\n` : `${paint('31', '[ FAIL ]')} ${shown}\n${message}\n`);
    };

    let remaining = names.slice();
    let firstRun = true;
    while (remaining.length && !userStopped) {
      const subset = firstRun ? [] : remaining;
      const stallMs = timedOut ? AFTER_HANG_TIMEOUT_MS : (opts.timeoutMs ?? PER_TEST_TIMEOUT_MS);
      let current: string | null = null;
      const before = results.size;
      const run = await runRunner(tc.cmd, opts, subset, stallMs, emit, (ev) => {
        if (ev.e === 'run') {
          current = ev.name;
          emit(`${paint('2', '[ RUN  ]')} ${pythonPrettyName(ev.name)}\n`);
        } else if (ev.e === 'done') {
          current = null;
          if (!results.has(ev.name)) record(ev.name, ev.ok, ev.message);
        }
      }, (c) => (child = c));

      if (firstRun && run.events.some((ev) => ev.e === 'error')) {
        // solution.py (or the tests) could not even be imported: the "compile error" case.
        return summary({ exitCode: run.code, durationMs: Date.now() - started });
      }
      if (firstRun && !run.events.some((ev) => ev.e === 'start')) {
        if (userStopped) return summary({ cancelled: true });
        const why = run.stalled
          ? `Importing solution.py took longer than ${STARTUP_TIMEOUT_MS / 1000}s. Is there an infinite loop outside a function?`
          : `Python stopped before running any test (exit code ${run.code}${run.signal ? `, ${run.signal}` : ''}).`;
        emit(`${paint('31', why)}\n`);
        return summary({ exitCode: run.code, signal: run.signal, timedOut: run.stalled, durationMs: Date.now() - started });
      }
      firstRun = false;

      if (current && !results.has(current)) {
        let message: string;
        if (run.stalled) {
          timedOut = true;
          message = `    timed out after ${stallMs / 1000}s: is there an infinite loop, or a loop whose condition never changes?`;
        } else if (userStopped) {
          message = '    stopped';
        } else if (run.flooded) {
          message = '    stopped: the code printed too much output';
        } else {
          message = `    the Python process died during this test (${run.signal ?? `exit code ${run.code}`})`;
        }
        record(current, false, message);
      }
      remaining = remaining.filter((n) => !results.has(n));
      if (results.size === before && remaining.length && !userStopped) {
        // No progress: never loop forever.
        for (const n of remaining) record(n, false, '    the test process stopped before this test ran');
        remaining = [];
      }
      // Tests named in the file but not found by the runner (for example a nested def).
      if (!run.stalled && !run.flooded && !userStopped && run.events.some((ev) => ev.e === 'end')) {
        for (const n of remaining) record(n, false, '    this test was not found when the tests were loaded');
        remaining = [];
      }
    }

    const tests: TestOutcome[] = names
      .filter((n) => results.has(n))
      .map((n) => ({ name: pythonPrettyName(n), ok: results.get(n)!.ok, message: results.get(n)!.message }));
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
    emit(`Could not run the tests: ${(e as Error).message}\n`);
    return summary({});
  } finally {
    opts.signal?.removeEventListener('abort', onAbort);
  }
}

/** One run of dojo_runner.py. An empty `subset` means "all tests". */
function runRunner(
  python: string,
  opts: TestRunOptions,
  subset: string[],
  stallMs: number,
  emit: (text: string) => void,
  onEvent: (ev: RunnerEvent) => void,
  onChild: (c: ChildProcess) => void,
): Promise<ProcessRun> {
  return new Promise((resolve) => {
    const args = ['-B', '-u', path.join(opts.includeDir, RUNNER_FILE), '--solution', opts.solutionDir, '--tests', opts.testFile, ...subset];
    const proc = spawn(python, args, { cwd: opts.solutionDir, env: pythonEnv(), windowsHide: true });
    onChild(proc);
    proc.stdin.on('error', () => undefined);
    proc.stdin.end();
    const events: RunnerEvent[] = [];
    let stalled = false;
    let flooded = false;
    let bytes = 0;
    let pending = '';
    let timer: NodeJS.Timeout | undefined;
    const arm = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        stalled = true;
        kill(proc);
      }, ms);
    };
    arm(STARTUP_TIMEOUT_MS);
    proc.stdout.on('data', (d: Buffer) => {
      pending += d.toString();
      const cut = pending.lastIndexOf('\n');
      if (cut < 0) return;
      const complete = pending.slice(0, cut);
      pending = pending.slice(cut + 1);
      for (const ev of parseEvents(complete)) {
        events.push(ev);
        if (ev.e === 'run') arm(stallMs);
        onEvent(ev);
      }
    });
    // stderr carries the learner's prints and import errors: show them as they come.
    proc.stderr.on('data', (d: Buffer) => {
      bytes += d.length;
      if (bytes > MAX_OUTPUT_BYTES) {
        if (!flooded) {
          flooded = true;
          kill(proc);
        }
        return;
      }
      emit(d.toString());
    });
    proc.on('error', (e) => {
      clearTimeout(timer);
      emit(`Could not start ${path.basename(python)}: ${e.message}\n`);
      resolve({ events, code: -1, signal: null, stalled, flooded });
    });
    proc.on('close', (code, signal) => {
      clearTimeout(timer);
      for (const ev of parseEvents(pending)) {
        events.push(ev);
        onEvent(ev);
      }
      resolve({ events, code, signal, stalled, flooded });
    });
  });
}
