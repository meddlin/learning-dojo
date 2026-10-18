// Pure helpers for reading `go test -v` output. No process spawning, so they are
// unit-testable without a Go toolchain. Ported from the browser app's Go runner.

import * as path from 'path';

export const MAX_MESSAGE_LINES = 40;

/** "BFSOnAPath" -> "bfs on a path" */
export function prettyName(testName: string): string {
  return testName
    .replace(/^Test_?/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .toLowerCase()
    .trim();
}

/** Names of the Test functions in a *_test.go file, in source order. */
export function goTestNames(source: string): string[] {
  return [...source.matchAll(/^func (Test\w*)\(\s*\w+\s+\*testing\.T\s*\)/gm)].map((m) => m[1]);
}

/**
 * Boils the output of one test's `-test.v` run down to what a learner should read:
 *   at solution_test.go:12
 *   expected: ...
 *     actual: ...
 */
export function testMessage(output: string, buildDir: string): string {
  const lines = output.replace(/\r\n?/g, '\n').split('\n');
  const keep: string[] = [];
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

export interface ParsedTest {
  name: string;
  ok: boolean;
  lines: string[];
}

export interface ParsedRun {
  /** Tests that finished, in the order they ran. */
  done: ParsedTest[];
  /** If the process died partway (panic, fatal error, deadlock, os.Exit, kill): the test that was running. */
  crashed: { name: string | null; lines: string[] } | null;
}

/** Splits the output of `-test.v` into finished tests and, if the process died, the one that was running. */
export function parseTestRun(output: string): ParsedRun {
  const lines = output.replace(/\r\n?/g, '\n').split('\n');
  const done: ParsedTest[] = [];
  let cur: { name: string; lines: string[] } | null = null;
  let trailer: string[] | null = null;
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
  let crashed: ParsedRun['crashed'] = null;
  if (trailer) {
    if (cur) crashed = { name: cur.name, lines: [...cur.lines, ...trailer] };
    else if (done.length && !done[done.length - 1].ok) {
      const last = done.pop() as ParsedTest;
      crashed = { name: last.name, lines: [...last.lines, ...trailer] };
    } else crashed = { name: null, lines: trailer };
  } else if (cur) {
    crashed = { name: cur.name, lines: cur.lines };
  }
  return { done, crashed };
}
