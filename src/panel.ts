import * as vscode from 'vscode';
import type { Exercises } from './exercises';
import type { Session } from './session';
import { webviewHtml } from './webviewHtml';

/** Messages the exercise page may send. Anything else is ignored. */
type FromPanel =
  | { type: 'ready' }
  | { type: 'runTests' }
  | { type: 'run' }
  | { type: 'hint' }
  | { type: 'reveal' }
  | { type: 'reset' }
  | { type: 'practiceAgain' }
  | { type: 'openNext'; id: string };

const BODY = `<main id="root"><p class="muted">Pick an exercise from the Dojo view to begin.</p></main>`;

/** The exercise statement, hints and test results, shown beside the code. */
export class ExercisePanel implements vscode.Disposable {
  private panel?: vscode.WebviewPanel;
  private ready = false;
  private readonly disposables: vscode.Disposable[] = [];

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly session: Session,
    private readonly exercises: Exercises,
    private readonly actions: {
      runTests: (id: string) => Promise<void>;
      run: (id: string) => Promise<void>;
      open: (id: string) => Promise<void>;
    },
  ) {
    this.disposables.push(
      session.onDidChangeCurrent(() => this.push()),
      session.onDidChangeProgress(() => this.push()),
      session.onDidChangeFolder(() => this.push()),
      session.onDidChangeLanguage(() => this.push()),
      exercises.onDidChangeRun(() => this.push()),
    );
  }

  /** Shows the panel, creating it if it was closed. */
  show(column: vscode.ViewColumn = vscode.ViewColumn.One, preserveFocus = true): void {
    if (this.panel) {
      this.panel.reveal(column, preserveFocus);
      this.push();
      return;
    }
    const panel = vscode.window.createWebviewPanel('dojo.exercise', 'Exercise', { viewColumn: column, preserveFocus }, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
    });
    this.panel = panel;
    this.ready = false;
    panel.webview.html = webviewHtml({
      webview: panel.webview,
      extensionUri: this.extensionUri,
      title: 'Exercise',
      styles: ['base.css', 'exercise.css'],
      scripts: ['render.js', 'exercise.js'],
      body: BODY,
    });
    panel.webview.onDidReceiveMessage((m: FromPanel) => void this.onMessage(m), undefined, this.disposables);
    panel.onDidDispose(() => {
      this.panel = undefined;
      this.ready = false;
    });
  }

  private current() {
    return this.session.current;
  }

  private push(): void {
    if (!this.panel || !this.ready) return;
    const ex = this.current();
    if (!ex || !this.session.work) {
      void this.panel.webview.postMessage({ type: 'state', state: null });
      return;
    }
    const state = this.exercises.stateFor(ex);
    this.panel.title = ex.title;
    void this.panel.webview.postMessage({ type: 'state', state });
  }

  private async onMessage(m: FromPanel): Promise<void> {
    if (!m || typeof m !== 'object') return;
    if (m.type === 'ready') {
      this.ready = true;
      this.push();
      return;
    }
    if (m.type === 'openNext') {
      if (typeof m.id === 'string' && this.session.catalog.find(m.id)) await this.actions.open(m.id);
      return;
    }
    const ex = this.current();
    if (!ex) return;
    switch (m.type) {
      case 'runTests':
        await this.actions.runTests(ex.id);
        break;
      case 'run':
        await this.actions.run(ex.id);
        break;
      case 'hint':
        this.exercises.useHint(ex);
        break;
      case 'reveal':
        await this.exercises.revealReference(ex);
        break;
      case 'reset':
        await this.exercises.reset(ex);
        break;
      case 'practiceAgain':
        await this.exercises.practiceAgain(ex);
        break;
    }
    this.push();
  }

  dispose(): void {
    this.panel?.dispose();
    for (const d of this.disposables) d.dispose();
  }
}
