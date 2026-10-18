export type LanguageId = 'cpp' | 'go';

export interface TrackMeta {
  id: string;
  title: string;
  blurb: string;
}

export interface Exercise {
  id: string;
  track: string;
  language: LanguageId;
  title: string;
  summary: string;
  concepts: string[];
  minutes: number | null;
  hints: string[];
  /** Folder inside the extension that holds prompt.md, the starter and the test file. */
  dir: string;
}

export interface Track extends TrackMeta {
  exercises: Exercise[];
}

export type ProgressStatus = 'new' | 'started' | 'solved' | 'review-due' | 'reviewing';

export interface ProgressView {
  status: ProgressStatus;
  attempts: number;
  passes: number;
  hintsUsed: number;
  revealed: boolean;
  solvedAt: string | null;
  dueAt: string | null;
  reviewCount: number;
  inReview: boolean;
}

export interface TestOutcome {
  /** Matches `LanguagePack.resultName()` of the test's name in the test file. */
  name: string;
  ok: boolean;
  message: string;
}

export interface TestResults {
  passed: number;
  failed: number;
  total: number;
  tests: TestOutcome[];
}

export interface ToolchainInfo {
  /** Compiler or `go` command, or null when none was found. */
  cmd: string | null;
  version: string | null;
  /** Language standard: 'c++20' or 'c++17' for C++, 'go 1.22' for Go. */
  std: string | null;
  /** Runtime checks are on: sanitizers for C++, the race detector for Go. */
  checks: boolean;
  /** Go only: the toolchain's language version ("1.22"), used for the throw-away go.mod. */
  goLang?: string;
  /** A toolchain was found but is too old, with what it reported. */
  tooOld?: string;
}
