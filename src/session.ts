import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import type { Catalog, Catalogs } from './core/catalog';
import { DEFAULT_LANGUAGE, isLanguageId, LANGUAGES } from './core/languages';
import { LanguageProgress, ProgressStore } from './core/progress';
import type { Exercise, LanguageId, ProgressView } from './core/types';
import { WorkDir } from './core/workdir';

const ROOT_KEY = 'dojo.root';
const LANGUAGE_KEY = 'dojo.language';
const LAST_KEY = 'dojo.lastExercise';

const NEW_PROGRESS: ProgressView = {
  status: 'new',
  attempts: 0,
  passes: 0,
  hintsUsed: 0,
  revealed: false,
  solvedAt: null,
  dueAt: null,
  reviewCount: 0,
  inReview: false,
};

/**
 * Holds the learner's dojo folder (where exercise files and progress live), the
 * progress store inside it, which language is being practised, and which exercise
 * is "current" (each language remembers its own).
 */
export class Session implements vscode.Disposable {
  private _work?: WorkDir;
  private _store?: ProgressStore;
  private _language: LanguageId;
  private _currentId?: string;
  private lastByLanguage: Partial<Record<LanguageId, string>>;
  private watcher?: vscode.FileSystemWatcher;
  private readonly folderEmitter = new vscode.EventEmitter<void>();
  private readonly progressEmitter = new vscode.EventEmitter<void>();
  private readonly currentEmitter = new vscode.EventEmitter<string | undefined>();
  private readonly languageEmitter = new vscode.EventEmitter<LanguageId>();

  readonly onDidChangeFolder = this.folderEmitter.event;
  readonly onDidChangeProgress = this.progressEmitter.event;
  readonly onDidChangeCurrent = this.currentEmitter.event;
  readonly onDidChangeLanguage = this.languageEmitter.event;

  constructor(
    private readonly ctx: vscode.ExtensionContext,
    readonly catalogs: Catalogs,
  ) {
    const saved = ctx.globalState.get<string>(LANGUAGE_KEY);
    this._language = isLanguageId(saved) ? saved : DEFAULT_LANGUAGE;
    this.lastByLanguage = { ...ctx.globalState.get<Partial<Record<LanguageId, string>>>(LAST_KEY, {}) };
    this._currentId = this.lastByLanguage[this._language];
  }

  // ---- language ---------------------------------------------------------------

  get language(): LanguageId {
    return this._language;
  }

  get languageLabel(): string {
    return LANGUAGES[this._language].label;
  }

  /** The catalogue of the language being practised. */
  get catalog(): Catalog {
    return this.catalogs.get(this._language);
  }

  /** Switches language. Each language keeps its own current exercise, progress and chats. */
  async setLanguage(id: LanguageId): Promise<void> {
    if (id === this._language) return;
    this._language = id;
    this._currentId = this.lastByLanguage[id];
    await this.ctx.globalState.update(LANGUAGE_KEY, id);
    await vscode.commands.executeCommand('setContext', 'dojo.language', id);
    this.languageEmitter.fire(id);
    this.currentEmitter.fire(this._currentId);
    this.progressEmitter.fire();
  }

  /** The current exercise of the current language, if it still exists in the catalogue. */
  get current(): Exercise | undefined {
    return this._currentId ? this.catalog.find(this._currentId) : undefined;
  }

  /** Restores the remembered folder, or adopts the open workspace if it is already a dojo folder. */
  async restore(): Promise<void> {
    await vscode.commands.executeCommand('setContext', 'dojo.language', this._language);
    const saved = this.ctx.globalState.get<string>(ROOT_KEY);
    if (saved && fs.existsSync(saved)) {
      await this.attach(saved);
      return;
    }
    for (const f of vscode.workspace.workspaceFolders ?? []) {
      if (fs.existsSync(path.join(f.uri.fsPath, '.dojo', 'progress.json'))) {
        await this.setRoot(f.uri.fsPath);
        return;
      }
    }
    await vscode.commands.executeCommand('setContext', 'dojo.hasFolder', false);
  }

  get root(): string | undefined {
    return this._work?.root;
  }

  get work(): WorkDir | undefined {
    return this._work;
  }

  /** Progress for the current language. */
  get progress(): LanguageProgress | undefined {
    return this._store ? new LanguageProgress(this._store, this._language) : undefined;
  }

  /** Progress for a specific language, regardless of which one is current. */
  progressFor(lang: LanguageId): LanguageProgress | undefined {
    return this._store ? new LanguageProgress(this._store, lang) : undefined;
  }

  get currentId(): string | undefined {
    return this._currentId;
  }

  setCurrent(id: string | undefined): void {
    if (this._currentId === id) return;
    this._currentId = id;
    if (id) {
      this.lastByLanguage[this._language] = id;
      void this.ctx.globalState.update(LAST_KEY, this.lastByLanguage);
    }
    this.currentEmitter.fire(id);
  }

  /** Progress of an exercise in any language. */
  viewOf(ex: Pick<Exercise, 'id' | 'language'>): ProgressView {
    return this.progressFor(ex.language)?.view(ex.id) ?? { ...NEW_PROGRESS };
  }

  /** Progress of an exercise in the current language. */
  view(id: string): ProgressView {
    return this.progress ? this.progress.view(id) : { ...NEW_PROGRESS };
  }

  /** Remember `dir` as the dojo folder (creating it and its .dojo/ metadata if needed). */
  async setRoot(dir: string): Promise<void> {
    const resolved = path.resolve(dir);
    fs.mkdirSync(resolved, { recursive: true });
    await this.ctx.globalState.update(ROOT_KEY, resolved);
    await this.attach(resolved);
  }

  async clearRoot(): Promise<void> {
    await this.ctx.globalState.update(ROOT_KEY, undefined);
    this.detach();
    await vscode.commands.executeCommand('setContext', 'dojo.hasFolder', false);
    this.folderEmitter.fire();
  }

  private detach(): void {
    this.watcher?.dispose();
    this.watcher = undefined;
    this._work = undefined;
    this._store = undefined;
  }

  private async attach(dir: string): Promise<void> {
    this.detach();
    const work = new WorkDir(dir, this.catalogs);
    work.init();
    const store = new ProgressStore(work.progressFile);
    store.on('change', () => this.progressEmitter.fire());
    this._work = work;
    this._store = store;

    // Pick up edits made outside VS Code, for example after a `git pull`.
    try {
      this.watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.Uri.file(work.metaDir), 'progress.json'));
      const reload = () => store.reload();
      this.watcher.onDidChange(reload);
      this.watcher.onDidCreate(reload);
      this.watcher.onDidDelete(reload);
    } catch {
      /* watching is a nicety */
    }

    await vscode.commands.executeCommand('setContext', 'dojo.hasFolder', true);
    this.folderEmitter.fire();
    this.progressEmitter.fire();
  }

  dispose(): void {
    this.detach();
    this.folderEmitter.dispose();
    this.progressEmitter.dispose();
    this.currentEmitter.dispose();
    this.languageEmitter.dispose();
  }
}
