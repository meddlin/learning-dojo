import * as path from 'path';
import * as vscode from 'vscode';
import { Catalogs } from './core/catalog';
import { isLanguageId, LANGUAGE_IDS, LANGUAGES } from './core/languages';
import { ToolchainProvider } from './core/toolchain';
import type { Exercise, LanguageId } from './core/types';
import { Exercises, ReferenceProvider, REFERENCE_SCHEME } from './exercises';
import { chooseFolder, ensureFolder, useOpenFolder } from './folder';
import { ExercisePanel } from './panel';
import { PathProvider, type PathNode } from './pathView';
import { isPracticeMode, setPracticeMode, togglePracticeMode } from './practiceMode';
import { Session } from './session';
import { Testing } from './testing';
import { TutorView } from './tutorView';

const PRACTICE_OFFERED_KEY = 'dojo.practiceOffered';

export async function activate(ctx: vscode.ExtensionContext): Promise<void> {
  const catalogs = new Catalogs(path.join(ctx.extensionPath, 'languages'));
  const session = new Session(ctx, catalogs);
  const toolchains = new ToolchainProvider();
  const exercises = new Exercises(session, toolchains);
  const pathProvider = new PathProvider(session);

  const treeView = vscode.window.createTreeView('dojo.path', { treeDataProvider: pathProvider, showCollapseAll: true });
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50);
  status.command = 'dojo.path.focus';
  const languageItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 51);
  languageItem.command = 'dojo.switchLanguage';

  // ---- helpers ---------------------------------------------------------------

  const setInExercise = (value: boolean) => vscode.commands.executeCommand('setContext', 'dojo.inExercise', value);

  /** The exercise a command refers to: an id, a tree node, the active editor's file, or the current one. */
  const resolve = (arg?: unknown): Exercise | undefined => {
    if (typeof arg === 'string') return session.catalog.find(arg);
    if (arg && typeof arg === 'object' && (arg as PathNode).kind === 'exercise') return (arg as { ex: Exercise }).ex;
    const file = vscode.window.activeTextEditor?.document.uri;
    if (file?.scheme === 'file') {
      const fromFile = session.work?.exerciseForFile(file.fsPath);
      if (fromFile) return fromFile;
    }
    return session.current;
  };

  const pickExercise = async (): Promise<Exercise | undefined> => {
    const items = session.catalog.tracks().flatMap((t) => [
      { label: t.title, kind: vscode.QuickPickItemKind.Separator } as vscode.QuickPickItem,
      ...t.exercises.map((e) => ({ label: e.title, description: session.view(e.id).status.replace('-', ' '), detail: e.summary, id: e.id })),
    ]);
    const pick = await vscode.window.showQuickPick(items as Array<vscode.QuickPickItem & { id?: string }>, { title: 'Open exercise', matchOnDetail: true });
    return pick && 'id' in pick && pick.id ? session.catalog.find(pick.id) : undefined;
  };

  const panel = new ExercisePanel(ctx.extensionUri, session, exercises, {
    runTests: async (id) => {
      const ex = session.catalog.find(id);
      if (ex) await testing.runExercise(ex);
    },
    run: async (id) => {
      const ex = session.catalog.find(id);
      if (ex) await exercises.runMain(ex);
    },
    open: (id) => openExercise(id),
  });

  const openExercise = async (arg?: unknown): Promise<void> => {
    const ex = arg === undefined ? await pickExercise() : resolve(arg);
    if (!ex) return;
    if (!(await ensureFolder(session))) return;
    let uri: vscode.Uri;
    try {
      uri = exercises.prepare(ex);
    } catch (e) {
      void vscode.window.showErrorMessage(`Could not create the exercise file: ${(e as Error).message}`);
      return;
    }
    session.setCurrent(ex.id);
    panel.show(vscode.ViewColumn.One, true);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Two, preview: false });
    await setInExercise(true);
    const node = pathProvider.nodeFor(ex.id);
    if (node && treeView.visible) void treeView.reveal(node, { select: true, focus: false });
  };

  const onSolved = (ex: Exercise): void => {
    const next = session.catalogs.of(ex).nextAfter(ex.id, (e) => session.viewOf(e).status !== 'solved');
    const buttons = next ? [`Next: ${next.title}`] : [];
    void vscode.window.showInformationMessage(`${ex.title}: all tests pass. A review is scheduled for later.`, ...buttons).then((pick) => {
      if (pick && next) void openExercise(next.id);
    });
  };

  const testing = new Testing(session, exercises, onSolved);
  const tutor = new TutorView(ctx, session, exercises);

  const updateStatus = (): void => {
    languageItem.text = `$(symbol-namespace) ${session.languageLabel}`;
    languageItem.tooltip = `Learning Dojo language: ${session.languageLabel}. Click to switch.`;
    treeView.description = session.languageLabel;
    if (!session.root) {
      status.hide();
      languageItem.hide();
      treeView.badge = undefined;
      return;
    }
    languageItem.show();
    const total = session.catalog.all().length;
    const solved = pathProvider.solvedCount();
    const due = pathProvider.dueCount();
    const label = session.languageLabel;
    status.text = `$(mortar-board) ${solved}/${total}${due ? ` · ${due} due` : ''}`;
    status.tooltip = due ? `Learning Dojo (${label}): ${solved} of ${total} solved, ${due} to review` : `Learning Dojo (${label}): ${solved} of ${total} solved`;
    status.show();
    treeView.badge = due ? { value: due, tooltip: `${due} exercise${due === 1 ? '' : 's'} to review` } : undefined;
  };

  /** The file in the active editor decides the language: opening a Go solution switches to Go. */
  const syncActiveEditor = async (): Promise<void> => {
    const file = vscode.window.activeTextEditor?.document.uri;
    const ex = file?.scheme === 'file' ? session.work?.exerciseForFile(file.fsPath) : undefined;
    void setInExercise(Boolean(ex));
    if (!ex) return;
    if (ex.language !== session.language) await session.setLanguage(ex.language);
    session.setCurrent(ex.id);
  };

  /** Toggles the language (or picks one with the Quick Pick) and lands on the exercise last open in it. */
  const switchLanguage = async (arg?: unknown): Promise<void> => {
    let target: LanguageId | undefined;
    if (isLanguageId(arg)) {
      target = arg;
    } else {
      const items = LANGUAGE_IDS.map((id) => ({
        label: LANGUAGES[id].label,
        description: id === session.language ? 'current' : undefined,
        detail: `${catalogs.get(id).all().length} exercises`,
        id,
      }));
      target = (await vscode.window.showQuickPick(items, { title: 'Switch language', placeHolder: 'Each language keeps its own exercises, progress and tutor chats' }))?.id;
    }
    if (!target || target === session.language) return;
    await session.setLanguage(target);
    const remembered = session.current;
    if (remembered && session.root) await openExercise(remembered.id);
    else await setInExercise(false);
  };

  const offerPracticeMode = async (): Promise<void> => {
    if (ctx.globalState.get<boolean>(PRACTICE_OFFERED_KEY)) return;
    const root = session.root;
    if (!root || !vscode.workspace.workspaceFolders?.some((f) => f.uri.fsPath === root) || isPracticeMode(session)) return;
    await ctx.globalState.update(PRACTICE_OFFERED_KEY, true);
    const pick = await vscode.window.showInformationMessage(
      'Turn on practice mode for this folder? It switches off autocomplete and AI suggestions here, so you recall syntax yourself. You can change it any time.',
      'Turn On',
      'Not Now',
    );
    if (pick === 'Turn On') await setPracticeMode(session, true);
  };

  // ---- commands ----------------------------------------------------------------

  const reg = (id: string, fn: (...args: any[]) => unknown) => vscode.commands.registerCommand(id, fn);
  const withExercise = (fn: (ex: Exercise) => Promise<unknown> | unknown) => async (arg?: unknown) => {
    const ex = resolve(arg);
    if (!ex) {
      void vscode.window.showInformationMessage('Open an exercise first.');
      return;
    }
    await fn(ex);
  };

  ctx.subscriptions.push(
    session,
    exercises,
    treeView,
    status,
    panel,
    testing,
    tutor,
    vscode.window.registerWebviewViewProvider(TutorView.viewType, tutor, { webviewOptions: { retainContextWhenHidden: true } }),
    languageItem,
    vscode.workspace.registerTextDocumentContentProvider(REFERENCE_SCHEME, new ReferenceProvider(catalogs)),

    reg('dojo.chooseFolder', async () => {
      if (await chooseFolder(session)) await offerPracticeMode();
    }),
    reg('dojo.useOpenFolder', async () => {
      if (await useOpenFolder(session)) await offerPracticeMode();
    }),
    reg('dojo.switchLanguage', (arg?: unknown) => switchLanguage(arg)),
    reg('dojo.openExercise', (arg?: unknown) => openExercise(arg)),
    reg('dojo.openNext', async () => {
      if (!(await ensureFolder(session))) return;
      const from = session.currentId ?? '';
      const next = session.catalog.nextAfter(from, (e) => session.view(e.id).status !== 'solved');
      if (next) await openExercise(next.id);
      else void vscode.window.showInformationMessage('Every exercise is solved. Nice work. Reviews will appear here as they come due.');
    }),
    reg('dojo.runTests', withExercise((ex) => testing.runExercise(ex))),
    reg('dojo.run', withExercise((ex) => exercises.runMain(ex))),
    reg('dojo.resetExercise', withExercise((ex) => exercises.reset(ex))),
    reg('dojo.practiceAgain', withExercise((ex) => exercises.practiceAgain(ex))),
    reg('dojo.togglePracticeMode', () => togglePracticeMode(session)),
    reg('dojo.selectTutorModel', () => tutor.selectModel()),
    reg('dojo.refresh', async () => {
      toolchains.reset();
      session.progress?.reload();
      testing.rebuild();
      pathProvider.refresh();
      await exercises.detectCompiler();
    }),

    session.onDidChangeFolder(() => {
      pathProvider.refresh();
      updateStatus();
    }),
    session.onDidChangeLanguage(() => {
      pathProvider.reindex();
      updateStatus();
      void exercises.detectCompiler();
    }),
    session.onDidChangeProgress(() => {
      pathProvider.refresh();
      updateStatus();
    }),
    vscode.window.onDidChangeActiveTextEditor(() => void syncActiveEditor()),
  );

  await session.restore();
  pathProvider.reindex();
  updateStatus();
  await syncActiveEditor();
  void exercises.detectCompiler();
}

export function deactivate(): void {
  /* everything is disposed through ctx.subscriptions */
}
