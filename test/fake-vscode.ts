// A small stand-in for the `vscode` module, just big enough to activate the extension and
// drive its commands in plain Node. It records what the extension asked VS Code to do.
import * as fs from 'fs';
import * as path from 'path';

type Listener<T> = (e: T) => unknown;

export class EventEmitter<T> {
  private listeners: Array<Listener<T>> = [];
  event = (l: Listener<T>) => {
    this.listeners.push(l);
    return { dispose: () => (this.listeners = this.listeners.filter((x) => x !== l)) };
  };
  fire(e: T) {
    for (const l of [...this.listeners]) l(e);
  }
  dispose() {
    this.listeners = [];
  }
}

export class Uri {
  private constructor(readonly scheme: string, readonly path: string) {}
  static file(p: string) {
    return new Uri('file', p.replace(/\\/g, '/'));
  }
  static parse(s: string) {
    const m = s.match(/^([a-z][a-z0-9+.-]*):(.*)$/i)!;
    return new Uri(m[1], m[2].replace(/^\/\//, ''));
  }
  static joinPath(base: Uri, ...parts: string[]) {
    return new Uri(base.scheme, path.posix.join(base.path, ...parts));
  }
  get fsPath() {
    return this.path;
  }
  toString() {
    return `${this.scheme}:${this.path}`;
  }
}

export class Position {
  constructor(readonly line: number, readonly character: number) {}
  translate(dl = 0, dc = 0) {
    return new Position(this.line + dl, this.character + dc);
  }
}
export class Range {
  start: Position;
  end: Position;
  constructor(a: number | Position, b: number | Position, c?: number, d?: number) {
    this.start = typeof a === 'number' ? new Position(a, b as number) : a;
    this.end = typeof a === 'number' ? new Position(c!, d!) : (b as Position);
  }
}
export class Diagnostic {
  source?: string;
  constructor(readonly range: Range, readonly message: string, readonly severity: number) {}
}
export class ThemeIcon {
  constructor(readonly id: string, readonly color?: unknown) {}
}
export class ThemeColor {
  constructor(readonly id: string) {}
}
export class MarkdownString {
  value = '';
  constructor(v?: string, _t?: boolean) {
    this.value = v ?? '';
  }
  appendMarkdown(s: string) {
    this.value += s;
    return this;
  }
}
export class TreeItem {
  [k: string]: unknown;
  constructor(readonly label: string, readonly collapsibleState?: number) {}
}
export class TestMessage {
  constructor(readonly message: string) {}
}
export class RelativePattern {
  constructor(readonly base: unknown, readonly pattern: string) {}
}
export class WorkspaceEdit {
  edits: Array<{ uri: Uri; text: string }> = [];
  replace(uri: Uri, _range: Range, text: string) {
    this.edits.push({ uri, text });
  }
}
export class CancellationTokenSource {
  private em = new EventEmitter<void>();
  token = { isCancellationRequested: false, onCancellationRequested: this.em.event };
  cancel() {
    this.token.isCancellationRequested = true;
    this.em.fire();
  }
  dispose() {}
}
export class TestRunRequest {
  constructor(readonly include?: unknown[], readonly exclude?: unknown[], readonly profile?: unknown) {}
}

export const ViewColumn = { One: 1, Two: 2, Beside: -2 };
export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };
export const TreeItemCollapsibleState = { None: 0, Collapsed: 1, Expanded: 2 };
export const StatusBarAlignment = { Left: 1, Right: 2 };
export const QuickPickItemKind = { Separator: -1, Default: 0 };
export const DiagnosticSeverity = { Error: 0, Warning: 1 };
export const ProgressLocation = { Window: 10 };
export const TestRunProfileKind = { Run: 1 };

class TestItemCollection {
  private map = new Map<string, TestItem>();
  replace(items: TestItem[]) {
    this.map.clear();
    items.forEach((i) => this.map.set(i.id, i));
  }
  add(i: TestItem) {
    this.map.set(i.id, i);
  }
  get(id: string) {
    return this.map.get(id);
  }
  forEach(fn: (i: TestItem) => void) {
    this.map.forEach((i) => fn(i));
  }
  get size() {
    return this.map.size;
  }
}
export class TestItem {
  children = new TestItemCollection();
  parent?: TestItem;
  description?: string;
  constructor(readonly id: string, readonly label: string, readonly uri?: Uri) {}
}

/** What the fake lets a test script control and inspect. */
export class FakeWorld {
  contexts = new Map<string, unknown>();
  config = new Map<string, unknown>();
  commands = new Map<string, (...a: any[]) => unknown>();
  executed: string[] = [];
  messages: Array<{ kind: string; text: string; items: string[] }> = [];
  /** Decides what a message box returns; default: confirm modal warnings, ignore the rest. */
  answer: (kind: string, text: string, items: string[], modal: boolean) => string | undefined = (kind, _t, items, modal) => (modal ? items[0] : undefined);
  openDialogResult: Uri[] | undefined;
  quickPickAnswer: (items: any[]) => any = (items) => items[0];
  folders: Array<{ uri: Uri; name: string; index: number }> = [];
  documents: Array<any> = [];
  shownDocs: Array<{ uri: Uri; column?: number }> = [];
  panels: any[] = [];
  views = new Map<string, any>();
  contentProviders = new Map<string, any>();
  terminals: any[] = [];
  controllers: any[] = [];
  diagnostics = new Map<string, any[]>();
  statusBar: any[] = [];
  treeViews: any[] = [];
  runs: any[] = [];
}

export function createFakeVscode(world: FakeWorld) {
  const ev = {
    configChange: new EventEmitter<any>(),
    textChange: new EventEmitter<any>(),
    activeEditor: new EventEmitter<any>(),
    closeTerminal: new EventEmitter<any>(),
  };
  const msgBox = (kind: string) => async (text: string, ...rest: any[]) => {
    const modal = Boolean(rest[0] && typeof rest[0] === 'object' && rest[0].modal);
    const items = rest.filter((x) => typeof x === 'string');
    world.messages.push({ kind, text, items });
    return world.answer(kind, text, items, modal);
  };

  function makeDoc(uri: Uri) {
    const read = () => (uri.scheme === 'file' ? fs.readFileSync(uri.fsPath, 'utf8') : String(world.contentProviders.get(uri.scheme)?.provideTextDocumentContent(uri) ?? ''));
    return {
      uri,
      isDirty: false,
      getText: read,
      get lineCount() {
        return read().split('\n').length;
      },
      getWordRangeAtPosition: () => undefined,
      save: async () => true,
    };
  }

  const vscode = {
    EventEmitter, Uri, Position, Range, Diagnostic, ThemeIcon, ThemeColor, MarkdownString, TreeItem, TestMessage,
    RelativePattern, WorkspaceEdit, CancellationTokenSource, TestRunRequest, ViewColumn, ConfigurationTarget,
    TreeItemCollapsibleState, StatusBarAlignment, QuickPickItemKind, DiagnosticSeverity, ProgressLocation, TestRunProfileKind,
    Disposable: class { constructor(private fn: () => void) {} dispose() { this.fn(); } },

    commands: {
      registerCommand(id: string, fn: (...a: any[]) => unknown) {
        world.commands.set(id, fn);
        return { dispose: () => world.commands.delete(id) };
      },
      async executeCommand(id: string, ...args: any[]) {
        world.executed.push(id);
        if (id === 'setContext') {
          world.contexts.set(args[0], args[1]);
          return;
        }
        const fn = world.commands.get(id);
        return fn ? fn(...args) : undefined;
      },
    },

    window: {
      showInformationMessage: msgBox('info'),
      showWarningMessage: msgBox('warning'),
      showErrorMessage: msgBox('error'),
      async showQuickPick(items: any[]) {
        return world.quickPickAnswer(items);
      },
      async showOpenDialog() {
        return world.openDialogResult;
      },
      get activeTextEditor() {
        const d = world.shownDocs.at(-1);
        return d ? { document: makeDoc(d.uri) } : undefined;
      },
      async showTextDocument(doc: any, opts?: any) {
        world.shownDocs.push({ uri: doc.uri, column: opts?.viewColumn });
        ev.activeEditor.fire({ document: doc });
        return { document: doc };
      },
      onDidChangeActiveTextEditor: ev.activeEditor.event,
      onDidCloseTerminal: ev.closeTerminal.event,
      createStatusBarItem() {
        const s: any = { text: '', show() { s.visible = true; }, hide() { s.visible = false; }, dispose() {} };
        world.statusBar.push(s);
        return s;
      },
      createOutputChannel() {
        return { append() {}, appendLine() {}, clear() {}, show() {}, dispose() {} };
      },
      createTreeView(id: string, opts: any) {
        const tv: any = { id, opts, visible: false, reveal: async () => {}, dispose() {}, badge: undefined };
        world.treeViews.push(tv);
        return tv;
      },
      createTerminal(opts: any) {
        const t = { opts, show() {}, dispose() { ev.closeTerminal.fire(t); } };
        world.terminals.push(t);
        return t;
      },
      registerWebviewViewProvider(id: string, provider: any) {
        world.views.set(id, provider);
        return { dispose() {} };
      },
      createWebviewPanel(type: string, title: string, _col: any, _opts: any) {
        const received = new EventEmitter<any>();
        const dispose = new EventEmitter<void>();
        const panel: any = {
          type, title, posted: [] as any[], revealed: 0,
          webview: {
            html: '',
            cspSource: 'vscode-resource:',
            asWebviewUri: (u: Uri) => u,
            postMessage: async (m: any) => { panel.posted.push(m); return true; },
            onDidReceiveMessage: received.event,
          },
          reveal() { panel.revealed++; },
          onDidDispose: dispose.event,
          dispose() { dispose.fire(); },
          receive: (m: any) => received.fire(m),
        };
        world.panels.push(panel);
        return panel;
      },
      async withProgress(_o: any, task: () => Promise<any>) {
        return task();
      },
    },

    workspace: {
      get workspaceFolders() {
        return world.folders.length ? world.folders : undefined;
      },
      get textDocuments() {
        return world.documents;
      },
      getConfiguration(section?: string) {
        const key = (k: string) => (section ? `${section}.${k}` : k);
        return {
          get: (k: string, dflt?: unknown) => (world.config.has(key(k)) ? world.config.get(key(k)) : dflt),
          async update(k: string, v: unknown) {
            if (v === undefined) world.config.delete(key(k));
            else world.config.set(key(k), v);
            ev.configChange.fire({ affectsConfiguration: (s: string) => key(k).startsWith(s) });
          },
          inspect: (k: string) => ({ workspaceFolderValue: world.config.get(key(k)) }),
        };
      },
      onDidChangeConfiguration: ev.configChange.event,
      onDidChangeTextDocument: ev.textChange.event,
      registerTextDocumentContentProvider(scheme: string, provider: any) {
        world.contentProviders.set(scheme, provider);
        return { dispose() {} };
      },
      async openTextDocument(uri: Uri) {
        let doc = world.documents.find((d) => d.uri.toString() === uri.toString());
        if (!doc) {
          doc = makeDoc(uri);
          world.documents.push(doc);
        }
        return doc;
      },
      async applyEdit(edit: WorkspaceEdit) {
        for (const e of edit.edits) fs.writeFileSync(e.uri.fsPath, e.text);
        return true;
      },
      createFileSystemWatcher() {
        return { onDidChange: () => ({ dispose() {} }), onDidCreate: () => ({ dispose() {} }), onDidDelete: () => ({ dispose() {} }), dispose() {} };
      },
    },

    languages: {
      createDiagnosticCollection() {
        return {
          set: (u: Uri, d: any[]) => world.diagnostics.set(u.toString(), d),
          delete: (u: Uri) => world.diagnostics.delete(u.toString()),
          has: (u: Uri) => world.diagnostics.has(u.toString()),
          clear: () => world.diagnostics.clear(),
          dispose() {},
        };
      },
    },

    tests: {
      createTestController(id: string, label: string) {
        const profiles: any[] = [];
        const c: any = {
          id, label, items: new TestItemCollection(), profiles,
          createTestItem: (iid: string, l: string, uri?: Uri) => new TestItem(iid, l, uri),
          createRunProfile: (name: string, kind: number, runHandler: any, isDefault?: boolean) => {
            const p = { name, kind, runHandler, isDefault };
            profiles.push(p);
            return p;
          },
          createTestRun: (request: any) => {
            const run: any = { request, events: [] as any[], ended: false };
            for (const k of ['enqueued', 'started', 'passed', 'failed', 'errored', 'skipped']) run[k] = (item: TestItem, msg?: any) => run.events.push({ k, id: item.id, msg: msg?.message });
            run.appendOutput = (t: string) => (run.output = (run.output ?? '') + t);
            run.end = () => (run.ended = true);
            world.runs.push(run);
            return run;
          },
          dispose() {},
        };
        world.controllers.push(c);
        return c;
      },
    },
  };
  return vscode;
}
