import { buildCpp, CPP_MISSING_HELP, describeCpp, detectCpp, runCppTests } from './cpp';
import { parseCompilerOutput, parseGoOutput, type ParsedDiagnostic } from './diagnostics';
import { buildGo, describeGo, detectGo, GO_MISSING_HELP, runGoTests } from './go';
import { CPP, GO, PYTHON, type LanguagePack } from './languages';
import { buildPython, describePython, detectPython, pythonMissingHelp, runPythonTests } from './python';
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
  /** `dojo.python.path`: python interpreter to prefer. */
  pythonPath: string;
}

export const DEFAULT_SETTINGS: ToolSettings = { compiler: '', sanitizers: true, goPath: '', goRace: true, pythonPath: '' };

/** Everything that differs between languages once you have a toolchain: how to find, build and test with it. */
export interface Backend {
  pack: LanguagePack;
  detect(settings: ToolSettings): Promise<ToolchainInfo>;
  /** The settings that affect `detect`, as a cache key. */
  cacheKey(settings: ToolSettings): string;
  /** One short line for the exercise panel, for example "clang++ · c++20 · sanitizers". */
  describe(tc: ToolchainInfo): string;
  /** What to tell the learner when no toolchain was found. */
  missingHelp(tc: ToolchainInfo): string;
  /** The setting that points at the toolchain. */
  settingKey: string;
  /** Builds the learner's solution into a program to run in a terminal (for Python: checks its syntax). */
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
    cacheKey: (s) => `${s.compiler}\u0000${s.sanitizers}`,
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
    cacheKey: (s) => `${s.goPath}\u0000${s.goRace}`,
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
  python: {
    pack: PYTHON,
    detect: (s) => detectPython(s.pythonPath),
    cacheKey: (s) => s.pythonPath,
    describe: describePython,
    missingHelp: pythonMissingHelp,
    settingKey: 'dojo.python.path',
    build: buildPython,
    runTests: runPythonTests,
    // dojo_runner.py reports syntax and import errors in the compiler format.
    diagnostics: (out) => parseCompilerOutput(out, [PYTHON.solutionFile]),
    runEnv: { PYTHONUNBUFFERED: '1', PYTHONDONTWRITEBYTECODE: '1' },
    diagnosticSource: () => 'python',
  },
};

/** Caches one detection per (language, relevant settings). */
export class ToolchainProvider {
  private cached = new Map<string, Promise<ToolchainInfo>>();

  get(lang: LanguageId, settings: ToolSettings): Promise<ToolchainInfo> {
    const key = `${lang}\u0000${BACKENDS[lang].cacheKey(settings)}`;
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
