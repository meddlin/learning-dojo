'use strict';
// Compiles and runs exercise code. A Job streams compiler and program output as
// it happens and reports a summary when finished.

const { spawn, spawnSync } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ROOT } = require('./curriculum');

const INCLUDE_DIR = path.join(ROOT, 'include');
const BUILD_DIR = path.join(ROOT, 'build');

const TEST_TIMEOUT_MS = 10_000;
const RUN_TIMEOUT_MS = 60_000;
const MAX_OUTPUT_BYTES = 512 * 1024;

let toolchain = null;

function tryCompile(cmd, flags) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-probe-'));
  try {
    const src = path.join(dir, 'p.cpp');
    fs.writeFileSync(src, '#include <vector>\nint main() { std::vector<int> v{1}; return v.size() == 1 ? 0 : 1; }\n');
    const out = path.join(dir, 'p');
    const r = spawnSync(cmd, [...flags, src, '-o', out], { encoding: 'utf8', timeout: 60_000 });
    if (r.status !== 0) return false;
    const run = spawnSync(out, [], { timeout: 10_000, env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0' } });
    return run.status === 0;
  } catch {
    return false;
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Finds a C++ compiler and decides which language standard and sanitizers it supports.
function getToolchain() {
  if (toolchain) return toolchain;
  const candidates = [process.env.CXX, 'clang++', 'g++', 'c++'].filter(Boolean);
  for (const cmd of candidates) {
    const v = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
    if (v.error || v.status !== 0) continue;
    const std = tryCompile(cmd, ['-std=c++20']) ? 'c++20' : tryCompile(cmd, ['-std=c++17']) ? 'c++17' : null;
    if (!std) continue;
    const sanitizers = tryCompile(cmd, [`-std=${std}`, '-fsanitize=address,undefined']);
    toolchain = { cmd, version: v.stdout.split('\n')[0].trim(), std, sanitizers };
    return toolchain;
  }
  toolchain = { cmd: null, version: null, std: null, sanitizers: false };
  return toolchain;
}

function compileArgs(tc, { mode, workDir, exerciseDir, outFile }) {
  const args = [`-std=${tc.std}`, '-g', '-O0', '-Wall', '-Wextra', '-Wno-unused-parameter', '-fdiagnostics-color=always'];
  args.push('-isystem', INCLUDE_DIR);
  if (tc.sanitizers) {
    args.push('-fsanitize=address,undefined', '-fno-sanitize-recover=undefined', '-fno-omit-frame-pointer');
  }
  if (mode === 'test') {
    args.push('-DDOJO_TEST', '-I', workDir, path.join(exerciseDir, 'test.cpp'));
  } else {
    args.push(path.join(workDir, 'solution.cpp'));
  }
  args.push('-o', outFile);
  return args;
}

class Job extends EventEmitter {
  // mode: 'run' (your own main) or 'test' (the exercise's tests).
  // workDir must contain solution.cpp; exerciseDir contains test.cpp.
  constructor({ mode, workDir, exerciseDir }) {
    super();
    this.mode = mode;
    this.workDir = workDir;
    this.exerciseDir = exerciseDir;
    this.child = null;
    this.killedBy = null;
    this.bytes = 0;
    this.finished = false;
  }

  out(text) {
    this.emit('out', text);
  }

  async start() {
    const tc = getToolchain();
    if (!tc.cmd) {
      this.out('\x1b[31mNo C++ compiler found.\x1b[0m\nInstall one (on macOS: run `xcode-select --install`) and restart the server.\n');
      return this.finish({ compiled: false, error: 'no-compiler' });
    }
    fs.mkdirSync(BUILD_DIR, { recursive: true });
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.binary = path.join(BUILD_DIR, `${path.basename(this.workDir)}-${this.mode}-${stamp}`);
    this.resultFile = `${this.binary}.json`;

    const args = compileArgs(tc, {
      mode: this.mode,
      workDir: this.workDir,
      exerciseDir: this.exerciseDir,
      outFile: this.binary,
    });
    this.emit('phase', 'compiling');
    this.out(`\x1b[2m$ ${path.basename(tc.cmd)} -std=${tc.std} ${this.mode === 'test' ? 'test.cpp' : 'solution.cpp'}${tc.sanitizers ? ' (with sanitizers)' : ''}\x1b[0m\n`);

    const compiled = await new Promise((resolve) => {
      const cc = spawn(tc.cmd, args, { cwd: this.workDir });
      this.child = cc;
      cc.stdout.on('data', (d) => this.out(d.toString()));
      cc.stderr.on('data', (d) => this.out(d.toString()));
      cc.on('error', (e) => {
        this.out(`Could not start the compiler: ${e.message}\n`);
        resolve(false);
      });
      cc.on('close', (code) => resolve(code === 0));
    });
    if (this.killedBy) return this.finish({ compiled: false, killed: true });
    if (!compiled) return this.finish({ compiled: false });

    this.emit('phase', this.mode === 'test' ? 'testing' : 'running');
    const timeoutMs = this.mode === 'test' ? TEST_TIMEOUT_MS : RUN_TIMEOUT_MS;
    const env = {
      ...process.env,
      DOJO_RESULT_FILE: this.resultFile,
      ASAN_OPTIONS: 'detect_leaks=0:color=always',
      UBSAN_OPTIONS: 'print_stacktrace=1:color=always',
    };
    const started = Date.now();
    const child = spawn(this.binary, [], { cwd: this.workDir, env });
    this.child = child;
    const timer = setTimeout(() => {
      this.killedBy = 'timeout';
      child.kill('SIGKILL');
    }, timeoutMs);

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
    if (this.mode === 'test') child.stdin.end();

    const { code, signal } = await new Promise((resolve) => {
      child.on('error', (e) => {
        this.out(`Could not start the program: ${e.message}\n`);
        resolve({ code: -1, signal: null });
      });
      child.on('close', (c, s) => resolve({ code: c, signal: s }));
    });
    clearTimeout(timer);

    let results = null;
    try {
      results = JSON.parse(fs.readFileSync(this.resultFile, 'utf8'));
    } catch {
      /* the program never reached the end of the tests */
    }

    if (this.killedBy === 'timeout') {
      this.out(`\n\x1b[31mStopped after ${timeoutMs / 1000}s.\x1b[0m Is there an infinite loop, or is the program waiting for input?\n`);
    } else if (this.killedBy === 'output') {
      this.out('\n\x1b[31mStopped: the program printed too much output.\x1b[0m\n');
    } else if (this.killedBy === 'user') {
      this.out('\n\x1b[33mStopped.\x1b[0m\n');
    } else if (signal) {
      this.out(`\n\x1b[31mThe program crashed (${signal}).\x1b[0m Check the messages above for the line that failed.\n`);
    } else if (code !== 0 && !results) {
      this.out(`\n\x1b[2mThe program exited with code ${code}.\x1b[0m\n`);
    } else if (this.mode === 'run') {
      this.out(`\n\x1b[2mProgram finished (exit code ${code}).\x1b[0m\n`);
    }

    return this.finish({
      compiled: true,
      exitCode: code,
      signal,
      timedOut: this.killedBy === 'timeout',
      durationMs: Date.now() - started,
      results,
    });
  }

  finish(summary) {
    if (this.finished) return;
    this.finished = true;
    for (const f of [this.binary, this.resultFile]) {
      if (f) fs.rmSync(f, { force: true, recursive: true });
    }
    // macOS leaves a .dSYM bundle next to debug builds.
    if (this.binary) fs.rmSync(`${this.binary}.dSYM`, { force: true, recursive: true });
    this.emit('done', summary);
  }

  writeStdin(data) {
    const stdin = this.child && this.child.stdin;
    if (this.mode === 'run' && stdin && stdin.writable && !stdin.destroyed) stdin.write(data);
  }

  endStdin() {
    const stdin = this.child && this.child.stdin;
    if (stdin && !stdin.destroyed) stdin.end();
  }

  kill() {
    if (this.finished || !this.child) return;
    this.killedBy = this.killedBy || 'user';
    this.child.kill('SIGKILL');
  }
}

module.exports = { Job, getToolchain };
