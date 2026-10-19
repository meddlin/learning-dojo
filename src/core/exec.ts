import { execFile } from 'child_process';

export interface Exec {
  code: number | null;
  stdout: string;
  stderr: string;
  error?: Error;
}

/** Runs a command to completion. Never rejects: failures come back in `code` and `error`. */
export function exec(cmd: string, args: string[], timeoutMs: number, env?: NodeJS.ProcessEnv, cwd?: string): Promise<Exec> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, env: env ?? process.env, cwd, encoding: 'utf8', windowsHide: true }, (error, stdout, stderr) => {
      const e = error as (Error & { code?: unknown }) | null;
      const code = e ? (typeof e.code === 'number' ? e.code : null) : 0;
      resolve({ code, stdout: String(stdout), stderr: String(stderr), error: error ?? undefined });
    });
  });
}
