import * as path from 'path';
import * as vscode from 'vscode';
import type { Catalogs } from './core/catalog';
import { stripAnsi } from './core/diagnostics';
import { isLanguageId, LANGUAGES } from './core/languages';
import { cleanupBinary, EXE } from './core/runner';
import { BACKENDS, type ToolchainProvider, type ToolSettings } from './core/toolchain';
import type { Exercise, LanguageId, ProgressView, TestResults, ToolchainInfo } from './core/types';
import type { Session } from './session';

/** What the last test run of an exercise looked like (kept in memory only). */
export interface RunRecord {
  exerciseId: string;
  language: LanguageId;
  at: number;
  compiled: boolean;
  cancelled: boolean;
  timedOut: boolean;
  exitCode: number | null;
  signal: string | null;
  results: TestResults | null;
  passedAll: boolean;
  /** Compiler and test output with colour codes removed. */
  output: string;
}

/** Everything the exercise panel needs to draw itself. */
export interface PanelState {
  exercise: {
    id: string;
    title: string;
    language: string;
    track: string;
    minutes: number | null;
    concepts: string[];
    prompt: string;
    hints: string[];
    hintCount: number;
  };
  progress: ProgressView;
  canReveal: boolean;
  running: boolean;
  last: Omit<RunRecord, 'output'> | null;
  next: { id: string; title: string } | null;
  compiler: string;
  dueDays: number | null;
}

export const REFERENCE_SCHEME = 'dojo-reference';

/** Exercise ids repeat across languages, so in-memory state is keyed by both. */
const keyOf = (ex: Pick<Exercise, 'language' | 'id'>) => `${ex.language}:${ex.id}`;

export class Exercises implements vscode.Disposable {
  private readonly runs = new Map<string, RunRecord>();
  private readonly running = new Set<string>();
  private readonly terminals = new Map<string, { term: vscode.Terminal; binary: string }>();
  private readonly disposables: vscode.Disposable[] = [];
  private readonly runEmitter = new vscode.EventEmitter<string>();
  readonly onDidChangeRun = this.runEmitter.event;
  readonly diagnostics = vscode.languages.createDiagnosticCollection('dojo');
  readonly output = vscode.window.createOutputChannel('Learning Dojo');

  constructor(
    private readonly session: Session,
    private readonly toolchains: ToolchainProvider,
  ) {
    this.disposables.push(
      this.runEmitter,
      this.diagnostics,
      this.output,
      // Squiggles from an old compile would point at the wrong lines once the file changes.
      vscode.workspace.onDidChangeTextDocument((e) => {
        if (e.contentChanges.length > 0 && this.diagnostics.has(e.document.uri)) this.diagnostics.delete(e.document.uri);
      }),
      vscode.window.onDidCloseTerminal((t) => {
        for (const [id, entry] of this.terminals) {
          if (entry.term === t) {
            this.terminals.delete(id);
            this.removeBinary(entry.binary);
          }
        }
      }),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (['dojo.compiler', 'dojo.sanitizers', 'dojo.go.path', 'dojo.go.race'].some((k) => e.affectsConfiguration(k))) this.toolchains.reset();
      }),
    );
  }

  private get catalogs(): Catalogs {
    return this.session.catalogs;
  }

  // ---- toolchain -----------------------------------------------------------

  private settings(): ToolSettings {
    const cfg = vscode.workspace.getConfiguration('dojo');
    return {
      compiler: cfg.get<string>('compiler', ''),
      sanitizers: cfg.get<boolean>('sanitizers', true),
      goPath: cfg.get<string>('go.path', ''),
      goRace: cfg.get<boolean>('go.race', true),
    };
  }

  async toolchain(lang: LanguageId = this.session.language): Promise<ToolchainInfo> {
    return this.toolchains.get(lang, this.settings());
  }

  private async requireToolchain(lang: LanguageId): Promise<ToolchainInfo | undefined> {
    const tc = await this.toolchain(lang);
    if (tc.cmd) return tc;
    const backend = BACKENDS[lang];
    const pick = await vscode.window.showErrorMessage(backend.missingHelp(tc), 'Open Settings', 'Check Again');
    if (pick === 'Open Settings') await vscode.commands.executeCommand('workbench.action.openSettings', backend.settingKey);
    if (pick === 'Check Again') {
      this.toolchains.reset();
      void this.detectCompiler(lang);
      return this.requireToolchain(lang);
    }
    return undefined;
  }

  // ---- files -----------------------------------------------------------------

  /** Creates the solution file from the starter if needed, and returns its URI. */
  prepare(ex: Exercise): vscode.Uri {
    const work = this.session.work;
    if (!work) throw new Error('No dojo folder has been chosen yet.');
    return vscode.Uri.file(work.ensureSolution(ex));
  }

  private openDocument(ex: Exercise): vscode.TextDocument | undefined {
    const file = this.session.work?.solutionPath(ex);
    return file ? vscode.workspace.textDocuments.find((d) => d.uri.fsPath === file) : undefined;
  }

  /** The code as the learner sees it, including edits that have not been saved yet. */
  currentCode(ex: Exercise): string {
    return this.openDocument(ex)?.getText() ?? this.session.work?.readCode(ex) ?? this.catalogs.of(ex).starter(ex);
  }

  async saveSolution(ex: Exercise): Promise<void> {
    const doc = this.openDocument(ex);
    if (doc?.isDirty) await doc.save();
  }

  /** Replaces the solution's text, through the editor when it is open so nothing is left unsaved. */
  private async writeSolution(ex: Exercise, text: string): Promise<void> {
    const work = this.session.work;
    if (!work) return;
    const doc = this.openDocument(ex);
    if (doc) {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(doc.uri, new vscode.Range(0, 0, doc.lineCount, 0), text);
      await vscode.workspace.applyEdit(edit);
      await doc.save();
    } else {
      work.writeCode(ex, text);
    }
  }

  // ---- tests -----------------------------------------------------------------

  lastRun(ex: Exercise): RunRecord | undefined {
    return this.runs.get(keyOf(ex));
  }

  isRunning(ex: Exercise): boolean {
    return this.running.has(keyOf(ex));
  }

  async runTests(ex: Exercise, run?: vscode.TestRun, token?: vscode.CancellationToken): Promise<RunRecord | undefined> {
    const work = this.session.work;
    const progress = this.session.progressFor(ex.language);
    if (!work || !progress) return undefined;
    if (this.running.has(keyOf(ex))) {
      void vscode.window.showInformationMessage('The tests for this exercise are already running.');
      return undefined;
    }
    const backend = BACKENDS[ex.language];
    const tc = await this.requireToolchain(ex.language);
    if (!tc) return undefined;

    work.ensureSolution(ex);
    await this.saveSolution(ex);
    const uri = vscode.Uri.file(work.solutionPath(ex));
    this.diagnostics.delete(uri);
    this.running.add(keyOf(ex));
    this.runEmitter.fire(keyOf(ex));

    const abort = new AbortController();
    const cancel = token?.onCancellationRequested(() => abort.abort());
    try {
      const catalog = this.catalogs.of(ex);
      const summary = await backend.runTests({
        tc,
        solutionDir: work.dirOf(ex),
        testFile: catalog.testFile(ex),
        includeDir: catalog.includeDir,
        buildDir: work.buildDir,
        tag: `${ex.language}-${ex.id}-${Date.now().toString(36)}`,
        color: true,
        signal: abort.signal,
        onOutput: (text) => run?.appendOutput(text.replace(/\r?\n/g, '\r\n')),
      });
      const record: RunRecord = {
        exerciseId: ex.id,
        language: ex.language,
        at: Date.now(),
        compiled: summary.compiled,
        cancelled: summary.cancelled,
        timedOut: summary.timedOut,
        exitCode: summary.exitCode,
        signal: summary.signal,
        results: summary.results,
        passedAll: summary.passedAll,
        output: stripAnsi(summary.output),
      };
      this.runs.set(keyOf(ex), record);
      if (summary.compiled && !summary.cancelled) progress.recordTestRun(ex.id, summary.passedAll);
      await this.publishDiagnostics(ex, uri, summary.output, tc);
      if (!summary.compiled) {
        // Always keep the raw compiler text; show it when nothing could be underlined in the file.
        this.output.clear();
        this.output.append(record.output);
        if (!this.diagnostics.has(uri)) this.output.show(true);
      }
      return record;
    } finally {
      cancel?.dispose();
      this.running.delete(keyOf(ex));
      this.runEmitter.fire(keyOf(ex));
    }
  }

  private async publishDiagnostics(ex: Exercise, uri: vscode.Uri, output: string, tc: ToolchainInfo): Promise<void> {
    const backend = BACKENDS[ex.language];
    const parsed = backend.diagnostics(output);
    if (parsed.length === 0) {
      this.diagnostics.delete(uri);
      return;
    }
    const doc = await vscode.workspace.openTextDocument(uri);
    const source = backend.diagnosticSource(tc);
    const list = parsed.map((d) => {
      const line = Math.max(0, Math.min(d.line - 1, doc.lineCount - 1));
      const pos = new vscode.Position(line, Math.max(0, d.column - 1));
      const range = doc.getWordRangeAtPosition(pos) ?? new vscode.Range(pos, pos.translate(0, 1));
      const diag = new vscode.Diagnostic(range, d.message, d.severity === 'warning' ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error);
      diag.source = source;
      return diag;
    });
    this.diagnostics.set(uri, list);
  }

  // ---- running your own main() -----------------------------------------------

  async runMain(ex: Exercise): Promise<void> {
    const work = this.session.work;
    if (!work) return;
    const backend = BACKENDS[ex.language];
    const tc = await this.requireToolchain(ex.language);
    if (!tc) return;
    work.ensureSolution(ex);
    await this.saveSolution(ex);
    const uri = vscode.Uri.file(work.solutionPath(ex));
    this.diagnostics.delete(uri);

    const previous = this.terminals.get(keyOf(ex));
    if (previous) {
      this.terminals.delete(keyOf(ex));
      previous.term.dispose();
      this.removeBinary(previous.binary);
    }

    const binary = path.join(work.buildDir, `${ex.language}-${ex.id}-run-${Date.now().toString(36)}${EXE}`);
    this.output.clear();
    const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: `Compiling ${ex.title}…` }, () =>
      backend.build({ tc, kind: 'run', solutionDir: work.dirOf(ex), includeDir: this.catalogs.of(ex).includeDir, outFile: binary, color: false, onOutput: (t) => this.output.append(t) }),
    );
    await this.publishDiagnostics(ex, uri, result.output, tc);
    if (!result.ok) {
      this.removeBinary(binary);
      this.output.show(true);
      void vscode.window.showErrorMessage('Your code did not compile. The errors are underlined in the editor and listed in the Problems panel.');
      return;
    }

    // The program runs straight in a real terminal, so it behaves exactly as it would in your shell.
    const term = vscode.window.createTerminal({
      name: `Dojo: ${ex.title}`,
      shellPath: binary,
      cwd: work.dirOf(ex),
      env: backend.runEnv,
      iconPath: new vscode.ThemeIcon('play'),
    });
    this.terminals.set(keyOf(ex), { term, binary });
    term.show();
  }

  private removeBinary(binary: string): void {
    try {
      cleanupBinary(binary);
    } catch {
      /* on Windows the file may still be locked; the build folder is ignored by git anyway */
    }
  }

  // ---- hints, reference, reset -----------------------------------------------

  canReveal(ex: Exercise): boolean {
    const p = this.session.progressFor(ex.language)?.view(ex.id);
    return !!p && p.attempts >= 1 && p.hintsUsed >= ex.hints.length;
  }

  useHint(ex: Exercise): void {
    this.session.progressFor(ex.language)?.useHint(ex.id, ex.hints.length);
  }

  async revealReference(ex: Exercise): Promise<void> {
    if (!this.canReveal(ex)) {
      void vscode.window.showInformationMessage('The reference solution unlocks after you have run the tests once and used every hint.');
      return;
    }
    const pick = await vscode.window.showWarningMessage(
      'Show the reference solution?',
      { modal: true, detail: 'It is worth one more try first. If you look, this exercise is scheduled for a quick review tomorrow.' },
      'Show Solution',
    );
    if (pick !== 'Show Solution') return;
    this.session.progressFor(ex.language)?.markRevealed(ex.id);
    const uri = vscode.Uri.parse(`${REFERENCE_SCHEME}:/${ex.language}/${ex.id}/reference-solution.${LANGUAGES[ex.language].fileExt}`);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Beside, preview: true });
  }

  async reset(ex: Exercise): Promise<void> {
    const pick = await vscode.window.showWarningMessage(
      'Replace your code with the starter file?',
      { modal: true, detail: 'Your current code is saved in the history/ folder next to your solution file.' },
      'Reset',
    );
    if (pick !== 'Reset') return;
    await this.saveSolution(ex);
    const work = this.session.work;
    if (!work) return;
    const starter = work.archiveAndReset(ex);
    await this.refreshOpenDocument(ex, starter);
    this.runs.delete(keyOf(ex));
    this.runEmitter.fire(keyOf(ex));
  }

  async practiceAgain(ex: Exercise): Promise<void> {
    const view = this.session.viewOf(ex);
    if (view.status !== 'solved' && view.status !== 'review-due') {
      void vscode.window.showInformationMessage('Solve this exercise first; then you can practise it again from a blank file.');
      return;
    }
    const pick = await vscode.window.showWarningMessage(
      'Start this exercise again from a blank file?',
      { modal: true, detail: 'Your current solution is saved in the history/ folder. Try to solve it without looking at it.' },
      'Start Again',
    );
    if (pick !== 'Start Again') return;
    await this.saveSolution(ex);
    const work = this.session.work;
    if (!work) return;
    this.session.progressFor(ex.language)?.startReview(ex.id);
    const starter = work.archiveAndReset(ex);
    await this.refreshOpenDocument(ex, starter);
    this.runs.delete(keyOf(ex));
    this.runEmitter.fire(keyOf(ex));
  }

  /** After the file changed on disk, make an open editor show the new text without a "file changed" prompt. */
  private async refreshOpenDocument(ex: Exercise, text: string): Promise<void> {
    const doc = this.openDocument(ex);
    if (doc && doc.getText() !== text) await this.writeSolution(ex, text);
  }

  // ---- state for the panel -----------------------------------------------------

  stateFor(ex: Exercise): PanelState {
    const progress = this.session.viewOf(ex);
    const last = this.runs.get(keyOf(ex));
    const catalog = this.catalogs.of(ex);
    const next = catalog.nextAfter(ex.id, (e) => this.session.viewOf(e).status !== 'solved');
    let dueDays: number | null = null;
    if (progress.dueAt) dueDays = Math.round((Date.parse(progress.dueAt) - Date.now()) / 86_400_000);
    return {
      exercise: {
        id: ex.id,
        title: ex.title,
        language: LANGUAGES[ex.language].label,
        track: catalog.trackOf(ex)?.title ?? '',
        minutes: ex.minutes,
        concepts: ex.concepts,
        prompt: catalog.prompt(ex),
        hints: ex.hints.slice(0, progress.hintsUsed),
        hintCount: ex.hints.length,
      },
      progress,
      canReveal: this.canReveal(ex),
      running: this.running.has(keyOf(ex)),
      last: last ? { exerciseId: last.exerciseId, language: last.language, at: last.at, compiled: last.compiled, cancelled: last.cancelled, timedOut: last.timedOut, exitCode: last.exitCode, signal: last.signal, results: last.results, passedAll: last.passedAll } : null,
      next: next ? { id: next.id, title: next.title } : null,
      compiler: this.compilerLabels[ex.language],
      dueDays,
    };
  }

  /** Short description of each language's toolchain, filled in once detection has finished. */
  readonly compilerLabels: Record<LanguageId, string> = { cpp: 'checking compiler…', go: 'checking Go…' };

  async detectCompiler(lang: LanguageId = this.session.language): Promise<ToolchainInfo> {
    const tc = await this.toolchain(lang);
    this.compilerLabels[lang] = BACKENDS[lang].describe(tc);
    this.runEmitter.fire('');
    return tc;
  }

  dispose(): void {
    for (const { term, binary } of this.terminals.values()) {
      term.dispose();
      this.removeBinary(binary);
    }
    this.terminals.clear();
    for (const d of this.disposables) d.dispose();
  }
}

/** Serves the reference solution as a read-only document. */
export class ReferenceProvider implements vscode.TextDocumentContentProvider {
  constructor(private readonly catalogs: Catalogs) {}

  /** URIs look like `dojo-reference:/<language>/<exercise id>/reference-solution.<ext>`. */
  provideTextDocumentContent(uri: vscode.Uri): string {
    const [lang = '', id = ''] = uri.path.split('/').slice(1);
    const catalog = isLanguageId(lang) ? this.catalogs.get(lang) : undefined;
    const ex = catalog?.find(id);
    const code = ex && catalog ? catalog.reference(ex) : null;
    if (!ex || !code) return '// No reference solution is available for this exercise.\n';
    return `// Reference solution for "${ex.title}".\n// Read it, close it, then write it again from memory in your own file.\n\n${code}`;
  }
}
