'use strict';
// Builds and runs exercise code with the Go toolchain. A Job streams compiler and
// program output as it happens and reports a summary when finished.
//
// Every job gets its own throw-away module under build/: your solution.go, plus
// (for tests) the exercise's solution_test.go and the shared dojo_test.go helpers.
// Tests are compiled once with `go test -c`, then each test function runs in its
// own process, so a panic, a deadlock or an infinite loop in one test cannot hide
// the results of the others.

const { spawn, spawnSync } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT } = require('../lib/curriculum');

const INCLUDE_DIR = path.join(ROOT, 'languages', 'go', 'include');
const BUILD_DIR = path.join(ROOT, 'build', 'go');

const MIN_GO_MINOR = 22; // loop-variable semantics, range over int
const PER_TEST_TIMEOUT_MS = 8_000;
const AFTER_HANG_TIMEOUT_MS = 3_000; // once one test has hung, give the others less rope
const RUN_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 512 * 1024;
const MAX_MESSAGE_LINES = 40;

let toolchain = null;

function goEnv(extra = {}) {
  return { ...process.env, GOTOOLCHAIN: 'local', GOFLAGS: '-buildvcs=false', GO111MODULE: 'on', ...extra };
}

// The module's language version decides which features the compiler allows. Learners
// get everything their toolchain offers; scripts/verify.js pins 1.22 (via DOJO_GO_LANG)
// so the curriculum itself never needs anything newer than the minimum.
function writeModule(dir, lang) {
  fs.writeFileSync(path.join(dir, 'go.mod'), `module dojo\n\ngo ${process.env.DOJO_GO_LANG || lang}\n`);
}

// Can this machine build and run a program with the race detector? (It needs cgo.)
function probeRace(cmd) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-probe-'));
  try {
    writeModule(dir, `1.${MIN_GO_MINOR}`);
    fs.writeFileSync(path.join(dir, 'p.go'), 'package main\n\nfunc main() {}\n');
    const out = path.join(dir, 'p');
    const r = spawnSync(cmd, ['build', '-race', '-o', out, '.'], { cwd: dir, encoding: 'utf8', timeout: 180_000, env: goEnv() });
    if (r.status !== 0) return false;
    return spawnSync(out, [], { timeout: 10_000 }).status === 0;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function candidateCommands() {
  const list = [process.env.GO];
  if (process.env.GOROOT) list.push(path.join(process.env.GOROOT, 'bin', 'go'));
  list.push('go', '/usr/local/go/bin/go', '/opt/homebrew/bin/go', '/usr/lib/go/bin/go', path.join(os.homedir(), 'go', 'bin', 'go'), path.join(os.homedir(), 'sdk', 'go', 'bin', 'go'));
  return list.filter(Boolean);
}

// Finds a Go toolchain new enough for the curriculum and checks for the race detector.
function getToolchain() {
  if (toolchain) return toolchain;
  for (const cmd of candidateCommands()) {
    const v = spawnSync(cmd, ['version'], { encoding: 'utf8', env: goEnv() });
    if (v.error || v.status !== 0) continue;
    const m = v.stdout.match(/go version go(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!m) continue;
    const minor = Number(m[2]);
    if (Number(m[1]) < 1 || (Number(m[1]) === 1 && minor < MIN_GO_MINOR)) {
      toolchain = { cmd: null, tooOld: v.stdout.trim(), version: null, std: null, race: false };
      continue;
    }
    const gofmt = path.join(path.dirname(path.resolve(cmd)), 'gofmt');
    toolchain = {
      cmd,
      gofmt: fs.existsSync(gofmt) ? gofmt : 'gofmt',
      version: v.stdout.trim(),
      std: `go ${m[1]}.${m[2]}`,
      lang: `${m[1]}.${m[2]}`,
      race: probeRace(cmd),
    };
    return toolchain;
  }
  if (!toolchain) toolchain = { cmd: null, version: null, std: null, race: false };
  return toolchain;
}

// Formats source the way `gofmt` would. Resolves {code} or {error}.
function formatSource(code) {
  return new Promise((resolve) => {
    const tc = getToolchain();
    if (!tc.cmd) return resolve({ error: 'Go is not installed.' });
    const child = spawn(tc.gofmt, [], { env: goEnv() });
    let out = '';
    let err = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), 10_000);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (err += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ error: `Could not run gofmt: ${e.message}` });
    });
    child.on('close', (status) => {
      clearTimeout(timer);
      if (status === 0) resolve({ code: out });
      else resolve({ error: err.replace(/<standard input>/g, 'solution.go').trim() || 'gofmt failed.' });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(code);
  });
}

// "BFSOnAPath" -> "bfs on a path"
function prettyName(testName) {
  return testName
    .replace(/^Test_?/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

// Boils the output of one `-test.v` run down to what a learner should read:
//   at solution_test.go:12
//   expected: ...
//     actual: ...
function testMessage(output, buildDir) {
  const lines = output.replace(/\r\n?/g, '\n').split('\n');
  const keep = [];
  let inTrace = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(=== (RUN|PAUSE|CONT|NAME)|--- (PASS|FAIL|SKIP)|PASS$|FAIL$|FAIL\t|ok\t|exit status)/.test(line)) continue;
    if (/^goroutine \d+ \[/.test(line)) {
      inTrace = true;
      continue;
    }
    if (inTrace) {
      // Stack traces: keep only frames inside the learner's own files (function line + file line).
      if (/^\s+\S+\.go:\d+/.test(line)) {
        const file = line.trim().replace(/ \+0x[0-9a-f]+$/, '');
        if (file.startsWith(buildDir) && /[\\/]solution(_test)?\.go:/.test(file)) {
          const fn = lines[i - 1] ? lines[i - 1].replace(/\(.*$/, '').replace(/^dojo\./, '').trim() : '';
          keep.push(`    at ${fn} (${path.basename(file)})`);
        }
      }
      continue;
    }
    if (line.trim() === '') continue;
    // t.Fatalf output: "    solution_test.go:12: message" then continuation lines indented by 8.
    const loc = line.match(/^ {4}(\S+\.go:\d+): ?(.*)$/);
    if (loc) {
      keep.push(`    at ${loc[1]}`);
      if (loc[2].trim()) keep.push(`    ${loc[2]}`);
      continue;
    }
    if (/^ {8}/.test(line)) {
      keep.push(`    ${line.slice(8)}`);
      continue;
    }
    keep.push(line.replace(buildDir + path.sep, '').replace(/ \[recovered(, repanicked)?\]/, ''));
  }
  if (keep.length > MAX_MESSAGE_LINES) keep.length = MAX_MESSAGE_LINES;
  return keep.join('\n');
}

// Splits the output of `-test.v` into the tests that finished and, if the process
// died partway (panic, fatal error, deadlock, os.Exit, kill), the test that was running.
//   done:    [{ name, ok, lines }]  in the order they ran
//   crashed: null | { name | null, lines }
function parseTestRun(output) {
  const lines = output.replace(/\r\n?/g, '\n').split('\n');
  const done = [];
  let cur = null;
  let trailer = null;
  for (const line of lines) {
    if (trailer) {
      trailer.push(line);
      continue;
    }
    let m = line.match(/^=== RUN\s+(\S+)/);
    if (m) {
      cur = { name: m[1], lines: [] };
      continue;
    }
    m = line.match(/^--- (PASS|FAIL|SKIP): (\S+) \(/);
    if (m && cur && cur.name === m[2]) {
      done.push({ name: cur.name, ok: m[1] !== 'FAIL', lines: cur.lines });
      cur = null;
      continue;
    }
    if (/^(panic: |fatal error: |runtime: |SIGSEGV|unexpected fault address)/.test(line)) {
      trailer = [line];
      continue;
    }
    if (/^(=== (PAUSE|CONT|NAME)|PASS$|FAIL$|FAIL\t|ok\t|exit status)/.test(line)) continue;
    if (cur) cur.lines.push(line);
  }
  let crashed = null;
  if (trailer) {
    if (cur) crashed = { name: cur.name, lines: [...cur.lines, ...trailer] };
    else if (done.length && !done[done.length - 1].ok) {
      const last = done.pop();
      crashed = { name: last.name, lines: [...last.lines, ...trailer] };
    } else crashed = { name: null, lines: trailer };
  } else if (cur) {
    crashed = { name: cur.name, lines: cur.lines };
  }
  return { done, crashed };
}

class Job extends EventEmitter {
  // mode: 'run' (your own main) or 'test' (the exercise's tests).
  // workDir must contain solution.go; exerciseDir contains solution_test.go.
  constructor({ mode, workDir, exerciseDir }) {
    super();
    this.mode = mode;
    this.workDir = workDir;
    this.exerciseDir = exerciseDir;
    this.child = null;
    this.killedBy = null;
    this.bytes = 0;
    this.finished = false;
    this.buildDir = null;
  }

  out(text) {
    this.emit('out', text);
  }

  runProcess(cmd, args, opts, onOut) {
    return new Promise((resolve) => {
      const child = spawn(cmd, args, opts);
      this.child = child;
      child.stdout.on('data', onOut);
      child.stderr.on('data', onOut);
      child.stdin.on('error', () => {});
      child.on('error', (e) => {
        onOut(`Could not start ${path.basename(cmd)}: ${e.message}\n`);
        resolve({ code: -1, signal: null });
      });
      child.on('close', (code, signal) => resolve({ code, signal }));
    });
  }

  async start() {
    const tc = getToolchain();
    if (!tc.cmd) {
      const why = tc.tooOld ? `Found "${tc.tooOld}", but the dojo needs Go 1.${MIN_GO_MINOR} or newer.` : 'No Go toolchain found.';
      this.out(`\x1b[31m${why}\x1b[0m\nInstall Go from https://go.dev/dl/ (or: brew install go) and restart the server.\n`);
      return this.finish({ compiled: false, error: 'no-compiler' });
    }

    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.buildDir = path.join(BUILD_DIR, `${path.basename(this.workDir)}-${this.mode}-${stamp}`);
    fs.mkdirSync(this.buildDir, { recursive: true });
    this.buildDir = fs.realpathSync(this.buildDir);
    writeModule(this.buildDir, tc.lang);
    try {
      fs.copyFileSync(path.join(this.workDir, 'solution.go'), path.join(this.buildDir, 'solution.go'));
      if (this.mode === 'test') {
        fs.copyFileSync(path.join(this.exerciseDir, 'solution_test.go'), path.join(this.buildDir, 'solution_test.go'));
        fs.copyFileSync(path.join(INCLUDE_DIR, 'dojo_test.go'), path.join(this.buildDir, 'dojo_test.go'));
      }
    } catch (e) {
      this.out(`\x1b[31mCould not prepare the build: ${e.message}\x1b[0m\n`);
      return this.finish({ compiled: false });
    }
    const binary = path.join(this.buildDir, this.mode === 'test' ? 'tests.bin' : 'program.bin');
    const race = tc.race ? ['-race'] : [];

    const sub = this.mode === 'test' ? ['test', '-c'] : ['build'];
    const args = [...sub, ...race, '-gcflags=-e', '-o', binary, '.'];
    this.emit('phase', 'compiling');
    this.out(`\x1b[2m$ go ${sub.join(' ')}${tc.race ? ' -race' : ''}  (${this.mode === 'test' ? 'solution.go + solution_test.go' : 'solution.go'})\x1b[0m\n`);

    const buildOut = [];
    const { code: buildCode } = await this.runProcess(tc.cmd, args, { cwd: this.buildDir, env: goEnv() }, (d) => {
      const text = d.toString().replace(/^# dojo( \[dojo\.test\])?\n/m, '');
      buildOut.push(text);
      this.out(text);
    });
    if (this.killedBy) return this.finish({ compiled: false, killed: true });
    if (buildCode !== 0) return this.finish({ compiled: false });

    return this.mode === 'test' ? this.runTests(tc, binary) : this.runProgram(tc, binary);
  }

  async runProgram(tc, binary) {
    this.emit('phase', 'running');
    const started = Date.now();
    const child = spawn(binary, [], { cwd: this.workDir, env: goEnv({ GORACE: 'halt_on_error=1' }) });
    this.child = child;
    const timer = setTimeout(() => {
      this.killedBy = 'timeout';
      child.kill('SIGKILL');
    }, RUN_TIMEOUT_MS);
    const onData = (d) => {
      this.bytes += d.length;
      if (this.bytes > MAX_OUTPUT_BYTES) {
        if (!this.killedBy) {
          this.killedBy = 'output';
          child.kill('SIGKILL');
        }
        return;
      }
      this.out(d.toString());
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.stdin.on('error', () => {});
    const { code, signal } = await new Promise((resolve) => {
      child.on('error', (e) => {
        this.out(`Could not start the program: ${e.message}\n`);
        resolve({ code: -1, signal: null });
      });
      child.on('close', (c, s) => resolve({ code: c, signal: s }));
    });
    clearTimeout(timer);

    if (this.killedBy === 'timeout') {
      this.out(`\n\x1b[31mStopped after ${RUN_TIMEOUT_MS / 1000}s.\x1b[0m Is there an infinite loop, or is the program waiting for input?\n`);
    } else if (this.killedBy === 'output') {
      this.out('\n\x1b[31mStopped: the program printed too much output.\x1b[0m\n');
    } else if (this.killedBy === 'user') {
      this.out('\n\x1b[33mStopped.\x1b[0m\n');
    } else if (signal) {
      this.out(`\n\x1b[31mThe program crashed (${signal}).\x1b[0m\n`);
    } else if (code === 2) {
      this.out('\n\x1b[31mThe program panicked.\x1b[0m The trace above shows the line that failed.\n');
    } else {
      this.out(`\n\x1b[2mProgram finished (exit code ${code}).\x1b[0m\n`);
    }
    return this.finish({
      compiled: true,
      exitCode: code,
      signal,
      timedOut: this.killedBy === 'timeout',
      durationMs: Date.now() - started,
      results: null,
    });
  }

  // Runs the compiled tests. Normally that is ONE process for all of them (starting a
  // race-detector binary costs about a second, so a process per test would be slow).
  // If a test panics, deadlocks or hangs, it is reported as failed and the tests that
  // had not run yet are started again in a fresh process, so one broken test never
  // hides the rest.
  async runTests(tc, binary) {
    this.emit('phase', 'testing');
    const started = Date.now();
    const env = goEnv({ GORACE: 'halt_on_error=1' });

    // Which tests are there? Read their names from the test file (source order). This
    // avoids a separate `-test.list` process, and starting one costs about a second
    // when the race detector is on.
    let names = [];
    try {
      const src = fs.readFileSync(path.join(this.buildDir, 'solution_test.go'), 'utf8');
      names = [...src.matchAll(/^func (Test\w*)\(\s*\w+\s+\*testing\.T\s*\)/gm)].map((m) => m[1]);
    } catch {
      /* handled below */
    }
    if (!names.length) {
      this.out('\x1b[31mNo tests found.\x1b[0m\n');
      return this.finish({ compiled: true, exitCode: 1, signal: null, timedOut: false, durationMs: Date.now() - started, results: null });
    }

    const dim = '\x1b[2m';
    const green = '\x1b[32m';
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    const results = new Map(); // test name -> { ok, message }
    let timedOut = false;

    const record = (name, ok, message) => {
      results.set(name, { ok, message });
      const shown = prettyName(name);
      this.out(`${dim}[ RUN  ]${reset} ${shown}\n`);
      this.out(ok ? `${green}[ PASS ]${reset} ${shown}\n` : `${red}[ FAIL ]${reset} ${shown}\n${message}\n`);
    };
    const indent = (text) => text.split('\n').map((l) => (l.startsWith('    ') ? l : `    ${l}`)).join('\n');

    let remaining = names.slice();
    while (remaining.length && this.killedBy !== 'user') {
      const subset = remaining.length === names.length ? [] : remaining;
      const stallMsUsed = timedOut ? AFTER_HANG_TIMEOUT_MS : PER_TEST_TIMEOUT_MS;
      const run = await this.runTestProcess(binary, env, subset, stallMsUsed);
      const parsed = parseTestRun(run.output);
      const before = results.size;

      for (const t of parsed.done) {
        if (!results.has(t.name)) record(t.name, t.ok, t.ok ? '' : testMessage(t.lines.join('\n'), this.buildDir));
      }
      if (parsed.crashed && parsed.crashed.name && !results.has(parsed.crashed.name)) {
        let message;
        if (run.stalled) {
          timedOut = true;
          message = `    timed out after ${stallMsUsed / 1000}s: is there an infinite loop, or a goroutine waiting forever?`;
        } else if (this.killedBy === 'user') {
          message = '    stopped';
        } else {
          message = testMessage(parsed.crashed.lines.join('\n'), this.buildDir);
          if (run.signal) message += `\n    the test process crashed (${run.signal})`;
          else if (!message) message = `    the test process exited with code ${run.code}`;
          message = indent(message);
        }
        record(parsed.crashed.name, false, message);
      }
      remaining = remaining.filter((n) => !results.has(n));
      if (results.size === before && remaining.length && this.killedBy !== 'user') {
        // No progress: the process died before reaching any test. Do not loop forever.
        const detail = testMessage(run.output, this.buildDir) || `the test process exited with code ${run.code}`;
        for (const n of remaining) record(n, false, indent(`the test process stopped before this test ran\n${detail}`));
        remaining = [];
      }
    }

    const tests = names.filter((n) => results.has(n)).map((n) => ({ name: prettyName(n), ok: results.get(n).ok, message: results.get(n).message }));
    const passedCount = tests.filter((t) => t.ok).length;
    const failedCount = tests.length - passedCount;
    this.out(`\n${failedCount ? red : green}${passedCount} of ${names.length} tests passed${reset}\n`);
    return this.finish({
      compiled: true,
      exitCode: failedCount || tests.length < names.length ? 1 : 0,
      signal: null,
      timedOut,
      killed: this.killedBy === 'user',
      durationMs: Date.now() - started,
      results: { passed: passedCount, failed: names.length - passedCount, total: names.length, tests },
    });
  }

  // One run of the test binary. `subset` empty means "all tests". A run that makes no
  // progress for PER_TEST_TIMEOUT_MS is killed ("stalled").
  runTestProcess(binary, env, subset, stallMs) {
    return new Promise((resolve) => {
      const args = ['-test.v', '-test.count=1'];
      if (subset.length) args.push(`-test.run=^(${subset.join('|')})$`);
      const child = spawn(binary, args, { cwd: this.buildDir, env });
      this.child = child;
      child.stdin.on('error', () => {});
      child.stdin.end();
      let output = '';
      let stalled = false;
      let timer = null;
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          stalled = true;
          child.kill('SIGKILL');
        }, stallMs);
      };
      arm();
      const onData = (d) => {
        const text = d.toString();
        if (output.length < MAX_OUTPUT_BYTES) output += text;
        if (/^(=== RUN|--- )/m.test(text)) arm(); // a test started or finished: still alive
      };
      child.stdout.on('data', onData);
      child.stderr.on('data', onData);
      child.on('error', () => {
        clearTimeout(timer);
        resolve({ output, code: -1, signal: null, stalled });
      });
      child.on('close', (code, signal) => {
        clearTimeout(timer);
        resolve({ output, code, signal, stalled });
      });
    });
  }

  finish(summary) {
    if (this.finished) return;
    this.finished = true;
    if (this.buildDir) fs.rmSync(this.buildDir, { force: true, recursive: true });
    this.emit('done', summary);
  }

  writeStdin(data) {
    const stdin = this.child && this.child.stdin;
    if (this.mode === 'run' && stdin && stdin.writable && !stdin.destroyed) stdin.write(data);
  }

  endStdin() {
    const stdin = this.child && this.child.stdin;
    if (this.mode === 'run' && stdin && !stdin.destroyed) stdin.end();
  }

  kill() {
    if (this.finished || !this.child) return;
    this.killedBy = this.killedBy || 'user';
    this.child.kill('SIGKILL');
  }
}

module.exports = { Job, getToolchain, formatSource, prettyName, parseTestRun };
