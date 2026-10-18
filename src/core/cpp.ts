import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { exec } from './exec';
import { cleanupBinary, EXE, kill, MAX_OUTPUT_BYTES, TEST_TIMEOUT_MS, type BuildRequest, type BuildResult, type TestRunOptions, type TestRunSummary } from './runner';
import type { TestResults, ToolchainInfo } from './types';

const PROBE_SOURCE = '#include <vector>\nint main() { std::vector<int> v{1}; return v.size() == 1 ? 0 : 1; }\n';

/** Compiles and runs a tiny program with `flags`; true if both steps work. */
async function probe(cmd: string, flags: string[]): Promise<boolean> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-probe-'));
  try {
    const src = path.join(dir, 'p.cpp');
    const out = path.join(dir, process.platform === 'win32' ? 'p.exe' : 'p');
    fs.writeFileSync(src, PROBE_SOURCE);
    const c = await exec(cmd, [...flags, src, '-o', out], 60_000);
    if (c.code !== 0) return false;
    const r = await exec(out, [], 10_000, { ...process.env, ASAN_OPTIONS: 'detect_leaks=0' });
    return r.code === 0;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const NONE: ToolchainInfo = { cmd: null, version: null, std: null, checks: false };

/**
 * Finds a C++ compiler and works out which language standard and sanitizers it
 * supports. `preferred` (the user's setting) is tried first.
 */
export async function detectCpp(preferred = '', useSanitizers = true): Promise<ToolchainInfo> {
  const candidates = [preferred, process.env.CXX, 'clang++', 'g++', 'c++'].filter((c): c is string => Boolean(c && c.trim()));
  for (const cmd of [...new Set(candidates)]) {
    const v = await exec(cmd, ['--version'], 10_000);
    if (v.code !== 0) continue;
    const std = (await probe(cmd, ['-std=c++20'])) ? 'c++20' : (await probe(cmd, ['-std=c++17'])) ? 'c++17' : null;
    if (!std) continue;
    const checks = useSanitizers && (await probe(cmd, [`-std=${std}`, '-fsanitize=address,undefined']));
    return { cmd, version: (v.stdout.split('\n')[0] || '').trim(), std, checks };
  }
  return NONE;
}

export function describeCpp(tc: ToolchainInfo): string {
  if (!tc.cmd) return 'no C++ compiler found';
  return `${path.basename(tc.cmd)} · ${tc.std}${tc.checks ? ' · sanitizers' : ''}`;
}

export const CPP_MISSING_HELP =
  'No C++ compiler found. On macOS run `xcode-select --install`; on Linux install g++ or clang; on Windows install MSYS2/MinGW-w64 or LLVM. Or set "dojo.compiler" to the compiler you want.';

export function compileArgs(req: Pick<BuildRequest, 'tc' | 'kind' | 'solutionDir' | 'testFile' | 'includeDir' | 'outFile' | 'color'>): string[] {
  const { tc } = req;
  const args = [`-std=${tc.std}`, '-g', '-O0', '-Wall', '-Wextra', '-Wno-unused-parameter', req.color ? '-fdiagnostics-color=always' : '-fdiagnostics-color=never'];
  args.push('-isystem', req.includeDir);
  if (tc.checks) args.push('-fsanitize=address,undefined', '-fno-sanitize-recover=undefined', '-fno-omit-frame-pointer');
  if (req.kind === 'test') {
    if (!req.testFile) throw new Error('testFile is required to build tests');
    args.push('-DDOJO_TEST', '-I', req.solutionDir, req.testFile);
  } else {
    args.push(path.join(req.solutionDir, 'solution.cpp'));
  }
  args.push('-o', req.outFile);
  return args;
}

export async function buildCpp(req: BuildRequest): Promise<BuildResult> {
  const { tc } = req;
  if (!tc.cmd) throw new Error('No compiler');
  fs.mkdirSync(path.dirname(req.outFile), { recursive: true });
  const args = compileArgs(req);
  let output = '';
  const emit = (t: string) => {
    output += t;
    req.onOutput?.(t);
  };
  emit(`$ ${path.basename(tc.cmd)} -std=${tc.std} ${req.kind === 'test' ? 'test.cpp' : 'solution.cpp'}${tc.checks ? ' (with sanitizers)' : ''}\n`);

  return new Promise<BuildResult>((resolve) => {
    const cc = spawn(tc.cmd as string, args, { cwd: req.solutionDir, windowsHide: true });
    let cancelled = false;
    const onAbort = () => {
      cancelled = true;
      kill(cc);
    };
    if (req.signal) {
      if (req.signal.aborted) onAbort();
      else req.signal.addEventListener('abort', onAbort, { once: true });
    }
    cc.stdout.on('data', (d: Buffer) => emit(d.toString()));
    cc.stderr.on('data', (d: Buffer) => emit(d.toString()));
    cc.on('error', (e) => {
      emit(`Could not start the compiler: ${e.message}\n`);
      resolve({ ok: false, cancelled, output });
    });
    cc.on('close', (code) => {
      req.signal?.removeEventListener('abort', onAbort);
      resolve({ ok: code === 0 && !cancelled, cancelled, output });
    });
  });
}

export async function runCppTests(opts: TestRunOptions): Promise<TestRunSummary> {
  const binary = path.join(opts.buildDir, `${opts.tag}-test${EXE}`);
  const resultFile = `${binary}.json`;
  let output = '';
  const emit = (t: string) => {
    output += t;
    opts.onOutput?.(t);
  };
  const fail = (extra: Partial<TestRunSummary>): TestRunSummary => ({
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

  try {
    const built = await buildCpp({
      tc: opts.tc,
      kind: 'test',
      solutionDir: opts.solutionDir,
      testFile: opts.testFile,
      includeDir: opts.includeDir,
      outFile: binary,
      color: opts.color,
      signal: opts.signal,
      onOutput: emit,
    });
    if (built.cancelled) return fail({ cancelled: true });
    if (!built.ok) return fail({});

    const timeoutMs = opts.timeoutMs ?? TEST_TIMEOUT_MS;
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      DOJO_RESULT_FILE: resultFile,
      ASAN_OPTIONS: `detect_leaks=0${opts.color ? ':color=always' : ''}`,
      UBSAN_OPTIONS: `print_stacktrace=1${opts.color ? ':color=always' : ''}`,
    };
    const started = Date.now();
    const child = spawn(binary, [], { cwd: opts.solutionDir, env, windowsHide: true });
    let killedBy: 'timeout' | 'output' | 'user' | null = null;
    let bytes = 0;
    const timer = setTimeout(() => {
      killedBy = 'timeout';
      kill(child);
    }, timeoutMs);
    const onAbort = () => {
      killedBy = killedBy ?? 'user';
      kill(child);
    };
    if (opts.signal) {
      if (opts.signal.aborted) onAbort();
      else opts.signal.addEventListener('abort', onAbort, { once: true });
    }
    const onData = (d: Buffer) => {
      bytes += d.length;
      if (bytes > MAX_OUTPUT_BYTES) {
        if (!killedBy) {
          killedBy = 'output';
          kill(child);
        }
        return;
      }
      emit(d.toString());
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.stdin.on('error', () => undefined);
    child.stdin.end();

    const { code, signal } = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
      child.on('error', (e) => {
        emit(`Could not start the program: ${e.message}\n`);
        resolve({ code: -1, signal: null });
      });
      child.on('close', (c, s) => resolve({ code: c, signal: s }));
    });
    clearTimeout(timer);
    opts.signal?.removeEventListener('abort', onAbort);

    let results: TestResults | null = null;
    try {
      results = JSON.parse(fs.readFileSync(resultFile, 'utf8')) as TestResults;
    } catch {
      /* the program never reached the end of the tests */
    }

    if (killedBy === 'timeout') emit(`\n${opts.color ? '\x1b[31m' : ''}Stopped after ${timeoutMs / 1000}s.${opts.color ? '\x1b[0m' : ''} Is there an infinite loop?\n`);
    else if (killedBy === 'output') emit('\nStopped: the program printed too much output.\n');
    else if (killedBy === 'user') emit('\nStopped.\n');
    else if (signal) emit(`\nThe program crashed (${signal}). Check the messages above for the line that failed.\n`);
    else if (code !== 0 && !results) emit(`\nThe program exited with code ${code}.\n`);

    const finished = killedBy === null && !signal;
    return {
      compiled: true,
      cancelled: killedBy === 'user',
      timedOut: killedBy === 'timeout',
      exitCode: code,
      signal,
      durationMs: Date.now() - started,
      results,
      passedAll: Boolean(finished && results && results.total > 0 && results.failed === 0 && code === 0),
      output,
    };
  } finally {
    cleanupBinary(binary);
  }
}
