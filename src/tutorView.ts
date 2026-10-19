import * as vscode from 'vscode';
import { buildMessages, listModels, MODES, ollamaBase, streamChat, type ChatMessage, type ModelList, type TutorMode } from './core/tutor';
import { LANGUAGES } from './core/languages';
import type { Exercise } from './core/types';
import type { Exercises } from './exercises';
import type { Session } from './session';
import { webviewHtml } from './webviewHtml';

type FromView =
  | { type: 'ready' }
  | { type: 'send'; text: string; share: boolean }
  | { type: 'stop' }
  | { type: 'clear' }
  | { type: 'setMode'; mode: string }
  | { type: 'setModel'; model: string }
  | { type: 'refreshModels' };

const CHAT_KEY = 'dojo.chat';
const MAX_SAVED = 30;

const BODY = `
<div id="app">
  <div class="bar">
    <div class="modes" role="group" aria-label="Tutor style">
      <button data-mode="socratic" title="Questions and nudges. No solutions.">Guide me</button>
      <button data-mode="explain" title="Explain concepts with other examples.">Explain</button>
      <button data-mode="code" title="Show code, then retype it from memory.">Show code</button>
    </div>
    <select id="model" aria-label="Model" title="Ollama model"></select>
  </div>
  <div id="status" class="status hidden" role="status"></div>
  <div id="log" aria-live="polite"></div>
  <div id="quick"></div>
  <form id="form">
    <label class="share"><input type="checkbox" id="share" checked> Share my code and last output</label>
    <textarea id="input" rows="3" placeholder="Ask about this exercise…" aria-label="Message"></textarea>
    <div class="row">
      <button type="button" class="btn" id="clear" title="Clear this exercise's chat">Clear</button>
      <span class="spacer"></span>
      <button type="button" class="btn hidden" id="stop">Stop</button>
      <button type="submit" class="btn primary" id="sendbtn">Send</button>
    </div>
  </form>
</div>`;

/** Tutor chat in the sidebar, backed by a local Ollama model. */
export class TutorView implements vscode.WebviewViewProvider, vscode.Disposable {
  static readonly viewType = 'dojo.tutor';
  private view?: vscode.WebviewView;
  private ready = false;
  private abort?: AbortController;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly ctx: vscode.ExtensionContext,
    private readonly session: Session,
    private readonly exercises: Exercises,
  ) {
    this.disposables.push(
      session.onDidChangeCurrent(() => {
        this.abort?.abort();
        void this.postInit();
      }),
      session.onDidChangeLanguage(() => {
        this.abort?.abort();
        void this.postInit();
      }),
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('dojo.tutor')) void this.postInit();
      }),
    );
  }

  resolveWebviewView(view: vscode.WebviewView): void {
    this.view = view;
    this.ready = false;
    view.webview.options = { enableScripts: true, localResourceRoots: [vscode.Uri.joinPath(this.ctx.extensionUri, 'media')] };
    view.webview.html = webviewHtml({
      webview: view.webview,
      extensionUri: this.ctx.extensionUri,
      title: 'Tutor',
      styles: ['base.css', 'tutor.css'],
      scripts: ['render.js', 'tutor.js'],
      body: BODY,
    });
    view.webview.onDidReceiveMessage((m: FromView) => void this.onMessage(m), undefined, this.disposables);
    view.onDidDispose(() => {
      this.abort?.abort();
      this.view = undefined;
      this.ready = false;
    });
  }

  // ---- settings and history --------------------------------------------------

  private config() {
    return vscode.workspace.getConfiguration('dojo.tutor');
  }

  private mode(): TutorMode {
    const m = this.config().get<string>('mode', 'socratic');
    return (MODES as string[]).includes(m) ? (m as TutorMode) : 'socratic';
  }

  private base(): string {
    return ollamaBase(this.config().get<string>('ollamaUrl', ''));
  }

  private allChats(): Record<string, ChatMessage[]> {
    return this.ctx.globalState.get<Record<string, ChatMessage[]>>(CHAT_KEY, {});
  }

  /** Chats are kept per exercise and language ("go:g01-adjacency-list"), since ids repeat across languages. */
  private chatKey(ex: Exercise): string {
    return `${ex.language}:${ex.id}`;
  }

  private history(ex: Exercise | undefined): ChatMessage[] {
    return ex ? this.allChats()[this.chatKey(ex)] ?? [] : [];
  }

  private async saveHistory(ex: Exercise, messages: ChatMessage[]): Promise<void> {
    const all = { ...this.allChats() };
    const key = this.chatKey(ex);
    if (messages.length === 0) delete all[key];
    else all[key] = messages.slice(-MAX_SAVED);
    await this.ctx.globalState.update(CHAT_KEY, all);
  }

  /** Model to use: the setting if it is installed, otherwise the first installed model. */
  private pickModel(configured: string, models: string[]): string {
    if (configured && (models.length === 0 || models.includes(configured))) return configured;
    return models[0] ?? configured;
  }

  // ---- messages --------------------------------------------------------------

  private post(msg: unknown): void {
    if (this.view && this.ready) void this.view.webview.postMessage(msg);
  }

  private async postInit(): Promise<void> {
    if (!this.view || !this.ready) return;
    const ex = this.session.current;
    const enabled = this.config().get<boolean>('enabled', true);
    let models: ModelList = { ok: true, models: [] };
    if (enabled) models = await listModels(this.base());
    this.post({
      type: 'init',
      enabled,
      mode: this.mode(),
      model: this.pickModel(this.config().get<string>('model', ''), models.models),
      models: models.models,
      error: models.ok ? undefined : models.error,
      language: this.session.languageLabel,
      exercise: ex ? { id: ex.id, title: ex.title } : null,
      history: this.history(ex),
    });
  }

  private async onMessage(m: FromView): Promise<void> {
    if (!m || typeof m !== 'object') return;
    switch (m.type) {
      case 'ready':
        this.ready = true;
        await this.postInit();
        return;
      case 'refreshModels':
        await this.postInit();
        return;
      case 'setMode':
        if ((MODES as string[]).includes(m.mode)) await this.config().update('mode', m.mode, vscode.ConfigurationTarget.Global);
        return;
      case 'setModel':
        if (typeof m.model === 'string') await this.config().update('model', m.model, vscode.ConfigurationTarget.Global);
        return;
      case 'stop':
        this.abort?.abort();
        return;
      case 'clear': {
        const ex = this.session.current;
        if (ex) await this.saveHistory(ex, []);
        this.post({ type: 'history', history: [] });
        return;
      }
      case 'send':
        if (typeof m.text === 'string' && m.text.trim()) await this.send(m.text.trim(), Boolean(m.share));
        return;
    }
  }

  private async send(text: string, share: boolean): Promise<void> {
    const ex = this.session.current;
    if (!ex) {
      this.post({ type: 'error', message: 'Open an exercise first, then ask about it.' });
      return;
    }
    if (this.abort) this.abort.abort();
    const abort = new AbortController();
    this.abort = abort;

    const history: ChatMessage[] = [...this.history(ex), { role: 'user', content: text }];
    const installed = await listModels(this.base());
    const model = this.pickModel(this.config().get<string>('model', ''), installed.models);
    if (!installed.ok || !model) {
      this.post({ type: 'error', message: installed.error ?? 'No Ollama model is installed. Run "ollama pull qwen2.5-coder:7b" and try again.' });
      this.abort = undefined;
      return;
    }

    const last = this.exercises.lastRun(ex);
    const messages = buildMessages(history, {
      language: LANGUAGES[ex.language],
      title: ex.title,
      prompt: this.session.catalogs.of(ex).prompt(ex),
      mode: this.mode(),
      code: share ? this.exercises.currentCode(ex) : undefined,
      output: share ? last?.output : undefined,
    });

    this.post({ type: 'started' });
    let reply = '';
    const error = await streamChat({
      base: this.base(),
      model,
      messages,
      signal: abort.signal,
      onDelta: (d) => {
        reply += d;
        if (this.isCurrent(ex)) this.post({ type: 'delta', text: d });
      },
    });
    const saved: ChatMessage[] = reply.trim() ? [...history, { role: 'assistant', content: reply }] : history;
    await this.saveHistory(ex, saved);
    if (this.abort === abort) this.abort = undefined;
    if (this.isCurrent(ex)) this.post({ type: 'done', error, stopped: abort.signal.aborted });
  }

  private isCurrent(ex: Exercise): boolean {
    const cur = this.session.current;
    return cur?.id === ex.id && cur.language === ex.language;
  }

  /** Command: pick a model from the Ollama server through the Quick Pick. */
  async selectModel(): Promise<void> {
    const list = await listModels(this.base());
    if (!list.ok) {
      void vscode.window.showErrorMessage(list.error ?? 'Could not reach Ollama.');
      return;
    }
    if (list.models.length === 0) {
      void vscode.window.showInformationMessage('Ollama has no models yet. Try "ollama pull qwen2.5-coder:7b".');
      return;
    }
    const pick = await vscode.window.showQuickPick(list.models, { placeHolder: 'Model for the Learning Dojo tutor' });
    if (!pick) return;
    await this.config().update('model', pick, vscode.ConfigurationTarget.Global);
  }

  dispose(): void {
    this.abort?.abort();
    for (const d of this.disposables) d.dispose();
  }
}
