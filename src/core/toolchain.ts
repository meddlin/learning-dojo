import { buildCpp, CPP_MISSING_HELP, describeCpp, detectCpp, runCppTests } from './cpp';
import { parseCompilerOutput, parseGoOutput, type ParsedDiagnostic } from './diagnostics';
import { buildGo, describeGo, detectGo, GO_MISSING_HELP, runGoTests } from './go';
import { CPP, GO, type LanguagePack } from './languages';
import type { BuildRequest, BuildResult, TestRunOptions, TestRunSummary } from './runner';
import type { LanguageId, ToolchainInfo } from './types';

/** The settings that decide which toolchain is used. */
export interface ToolSettings {
  /** `dojo.compiler`: C++ compiler to prefer. */
  compiler: string;
  /** `dojo.sanitizers`: build C++ with ASan and UBSan when available. */
  sanitizers: boolean;
  /** `dojo.go.path`: go binary to prefer. */
  goPath: string;
  /** `dojo.go.race`: build Go with the race detector when available. */
  goRace: boolean;
}

export const DEFAULT_SETTINGS: ToolSettings = { compiler: '', sanitizers: true, goPath: '', goRace: true };

/** Everything that differs between languages once you have a toolchain: how to find, build and test with it. */
export interface Backend {
  pack: LanguagePack;
  detect(settings: ToolSettings): Promise<ToolchainInfo>;
  /** One short line for the exercise panel, for example "clang++ · c++20 · sanitizers". */
  describe(tc: ToolchainInfo): string;
  /** What to tell the learner when no toolchain was found. */
  missingHelp(tc: ToolchainInfo): string;
  /** The setting that points at the toolchain. */
  settingKey: string;
  /** Builds the learner's solution into a program to run in a terminal. */
  build(req: BuildRequest): Promise<BuildResult>;
  runTests(opts: TestRunOptions): Promise<TestRunSummary>;
  /** Compiler errors and warnings located in the learner's solution file. */
  diagnostics(output: string): ParsedDiagnostic[];
  /** Extra environment for a program run in the terminal. */
  runEnv: Record<string, string>;
  /** Name shown as the source of editor squiggles. */
  diagnosticSource(tc: ToolchainInfo): string;
}

const basename = (cmd: string) => cmd.split(/[\\/]/).pop() ?? cmd;

export const BACKENDS: Record<LanguageId, Backend> = {
  cpp: {
    pack: CPP,
    detect: (s) => detectCpp(s.compiler, s.sanitizers),
    describe: describeCpp,
    missingHelp: () => CPP_MISSING_HELP,
    settingKey: 'dojo.compiler',
    build: buildCpp,
    runTests: runCppTests,
    diagnostics: (out) => parseCompilerOutput(out, [CPP.solutionFile]),
    runEnv: { ASAN_OPTIONS: 'detect_leaks=0', UBSAN_OPTIONS: 'print_stacktrace=1' },
    diagnosticSource: (tc) => (tc.cmd ? basename(tc.cmd) : 'compiler'),
  },
  go: {
    pack: GO,
    detect: (s) => detectGo(s.goPath, s.goRace),
    describe: describeGo,
    missingHelp: (tc) =>
      tc.tooOld ? `Found "${tc.tooOld}", but Learning Dojo needs Go 1.22 or newer. Install a newer Go from https://go.dev/dl/, or set "dojo.go.path".` : GO_MISSING_HELP,
    settingKey: 'dojo.go.path',
    build: buildGo,
    runTests: runGoTests,
    diagnostics: (out) => parseGoOutput(out, [GO.solutionFile]),
    runEnv: { GORACE: 'halt_on_error=1' },
    diagnosticSource: () => 'go',
  },
};

/** Caches one detection per (language, relevant settings). */
export class ToolchainProvider {
  private cached = new Map<string, Promise<ToolchainInfo>>();

  get(lang: LanguageId, settings: ToolSettings): Promise<ToolchainInfo> {
    const key = lang === 'cpp' ? `cpp\u0000${settings.compiler}\u0000${settings.sanitizers}` : `go\u0000${settings.goPath}\u0000${settings.goRace}`;
    let p = this.cached.get(key);
    if (!p) {
      p = BACKENDS[lang].detect(settings);
      this.cached.set(key, p);
    }
    return p;
  }

  /** Forget results so the next call looks again (for example after installing a compiler). */
  reset(): void {
    this.cached.clear();
  }
}
