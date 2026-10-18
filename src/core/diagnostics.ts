export interface ParsedDiagnostic {
  file: string;
  /** 1-based, as the compiler reports them. */
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'note';
  message: string;
}

// eslint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

export function stripAnsi(s: string): string {
  return s.replace(ANSI, '');
}

const LINE = /^(.+?):(\d+):(\d+): (fatal error|error|warning|note): (.*)$/;

/**
 * Pulls `file:line:col: severity: message` records out of g++/clang output.
 * Only records for files whose path ends with one of `files` (e.g. solution.cpp)
 * are returned; notes are attached to the previous error or warning.
 */
export function parseCompilerOutput(output: string, files: string[] = ['solution.cpp']): ParsedDiagnostic[] {
  const out: ParsedDiagnostic[] = [];
  for (const raw of stripAnsi(output).split(/\r?\n/)) {
    const m = LINE.exec(raw);
    if (!m) continue;
    const [, file, line, col, kind, message] = m;
    const base = file.replace(/\\/g, '/');
    if (!files.some((f) => base === f || base.endsWith(`/${f}`))) continue;
    const severity = kind === 'warning' ? 'warning' : kind === 'note' ? 'note' : 'error';
    if (severity === 'note') {
      const prev = out[out.length - 1];
      if (prev) prev.message += `\nnote: ${message}`;
      continue;
    }
    out.push({ file, line: Number(line), column: Number(col), severity, message });
  }
  return out;
}

const GO_LINE = /^(.+?\.go):(\d+):(\d+): (.*)$/;

/**
 * Pulls `file.go:line:col: message` records out of `go build` / `go vet` output.
 * Only records for files named in `files` are returned. Indented lines that follow a
 * record ("\tother declaration of x") are attached to it.
 */
export function parseGoOutput(output: string, files: string[] = ['solution.go']): ParsedDiagnostic[] {
  const out: ParsedDiagnostic[] = [];
  let attach: ParsedDiagnostic | null = null;
  for (const raw of stripAnsi(output).split(/\r?\n/)) {
    // Go indents the lines that elaborate on the previous error with a tab.
    if (attach && /^\s+\S/.test(raw)) {
      attach.message += `\n${raw.trim()}`;
      continue;
    }
    attach = null;
    const m = GO_LINE.exec(raw);
    if (!m) continue;
    const [, file, line, col, message] = m;
    const base = file.replace(/\\/g, '/').replace(/^\.\//, '');
    if (!files.some((f) => base === f || base.endsWith(`/${f}`))) continue;
    attach = { file, line: Number(line), column: Number(col), severity: 'error', message };
    out.push(attach);
  }
  return out;
}
