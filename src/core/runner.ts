// Types and helpers shared by the language backends (cpp.ts, go.ts).

import type { ChildProcess } from 'child_process';
import * as fs from 'fs';
import type { TestResults, ToolchainInfo } from './types';

export const TEST_TIMEOUT_MS = 10_000;
export const MAX_OUTPUT_BYTES = 512 * 1024;

export type BuildKind = 'test' | 'run';

/** Executable suffix: MinGW/MSVC always add .exe, so name it explicitly. */
export const EXE = process.platform === 'win32' ? '.exe' : '';

export interface BuildRequest {
  tc: ToolchainInfo;
  kind: BuildKind;
  /** Folder holding the learner's solution file. */
  solutionDir: string;
  /** The exercise's test file (required for kind 'test'). */
  testFile?: string;
  /** The language's shared include folder (dojo.h, dojo_test.go). */
  includeDir: string;
  outFile: string;
  color: boolean;
  signal?: AbortSignal;
  onOutput?: (text: string) => void;
}

export interface BuildResult {
  ok: boolean;
  cancelled: boolean;
  /** Raw compiler output (may contain ANSI colour codes when `color` is true). */
  output: string;
}

export interface TestRunOptions {
  tc: ToolchainInfo;
  solutionDir: string;
  testFile: string;
  includeDir: string;
  buildDir: string;
  /** Unique name for this run's build products. */
  tag: string;
  color: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
  onOutput?: (text: string) => void;
}

export interface TestRunSummary {
  compiled: boolean;
  cancelled: boolean;
  timedOut: boolean;
  exitCode: number | null;
  signal: string | null;
  durationMs: number;
  results: TestResults | null;
  /** True only when the program finished and every test passed. */
  passedAll: boolean;
  /** Everything printed by the compiler and the tests. */
  output: string;
}

/** Removes a build product and the .dSYM bundle macOS leaves next to debug builds. */
export function cleanupBinary(file: string): void {
  for (const f of [file, `${file}.dSYM`, `${file}.json`]) fs.rmSync(f, { force: true, recursive: true });
}

export function kill(child: ChildProcess): void {
  try {
    child.kill('SIGKILL');
  } catch {
    /* already gone */
  }
}
