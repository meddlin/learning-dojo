import assert from 'node:assert/strict';
import * as fs from 'fs';
import Module from 'node:module';
import * as os from 'os';
import * as path from 'path';
import { after, test } from 'node:test';
import { createFakeVscode, FakeWorld, Uri } from './fake-vscode';

// Make `require('vscode')` return the fake before the extension is loaded.
const world = new FakeWorld();
const fake = createFakeVscode(world);
const origLoad = (Module as any)._load;
(Module as any)._load = function (request: string, ...rest: unknown[]) {
  return request === 'vscode' ? fake : origLoad.call(this, request, ...rest);
};
after(() => ((Module as any)._load = origLoad));

const root = path.resolve(__dirname, '..');
const dojo = fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-ext-'));
const store = new Map<string, unknown>();
const ctx: any = {
  extensionPath: root,
  extensionUri: Uri.file(root),
  subscriptions: [] as Array<{ dispose(): unknown }>,
  globalState: {
    get: (k: string, d?: unknown) => (store.has(k) ? store.get(k) : d),
    update: async (k: string, v: unknown) => void (v === undefined ? store.delete(k) : store.set(k, v)),
  },
};
const cmd = (id: string, ...args: unknown[]) => {
  const fn = world.commands.get(id);
  assert.ok(fn, `command ${id} is registered`);
  return fn!(...args);
};
const ID = 'f01-ints-and-overflow';

test('every command contributed in package.json is registered, and vice versa', async () => {
  const ext = require('../src/extension');
  await ext.activate(ctx);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const declared = pkg.contributes.commands.map((c: { command: string }) => c.command).sort();
  const registered = [...world.commands.keys()].sort();
  assert.deepEqual(registered, declared);
  assert.equal(world.contexts.get('dojo.hasFolder'), false);
  assert.equal(world.contexts.get('dojo.language'), 'cpp', 'C++ is the default language');
  assert.ok(world.views.has('dojo.tutor'));
  assert.ok(world.treeViews.some((t) => t.id === 'dojo.path'));
  assert.ok(world.contentProviders.has('dojo-reference'));
});

test('choosing a folder creates .dojo and shows the path', async () => {
  world.openDialogResult = [Uri.file(dojo)];
  await cmd('dojo.chooseFolder');
  assert.equal(world.contexts.get('dojo.hasFolder'), true);
  assert.ok(fs.existsSync(path.join(dojo, '.dojo')));
  const tree = world.treeViews.find((t) => t.id === 'dojo.path').opts.treeDataProvider;
  const tracks = tree.getChildren();
  assert.equal(tracks.length, 3);
  assert.equal(tree.getChildren(tracks[0]).length > 5, true);
  const item = tree.getTreeItem(tree.getChildren(tracks[0])[0]);
  assert.equal(item.command.command, 'dojo.openExercise');
  assert.equal(world.statusBar[0].visible, true);
  assert.match(world.statusBar[0].text, /0\/32/);
  assert.equal(world.statusBar[1].visible, true);
  assert.match(world.statusBar[1].text, /C\+\+/);
  assert.equal(world.statusBar[1].command, 'dojo.switchLanguage');
  assert.equal(world.treeViews.find((t) => t.id === 'dojo.path').description, 'C++');
});

test('opening an exercise writes solution.cpp, shows the panel and the editor', async () => {
  await cmd('dojo.openExercise', ID);
  const sol = path.join(dojo, 'cpp', 'foundations', ID, 'solution.cpp');
  assert.ok(fs.existsSync(sol), 'solution.cpp created');
  assert.equal(world.shownDocs.at(-1)?.column, 2);
  assert.equal(world.contexts.get('dojo.inExercise'), true);
  const panel = world.panels.at(-1);
  assert.match(panel.webview.html, /Content-Security-Policy/);
  assert.match(panel.webview.html, /exercise\.js/);
  panel.receive({ type: 'ready' });
  const state = panel.posted.at(-1);
  assert.equal(state.type, 'state');
  assert.equal(state.state.exercise.id, ID);
  assert.equal(state.state.progress.status, 'new');
  assert.ok(state.state.exercise.prompt.length > 50);
});

test('running the tests on the starter fails, records an attempt, and reports per-test results', async () => {
  const before = world.runs.length;
  await cmd('dojo.runTests');
  const run = world.runs[before];
  assert.ok(run?.ended, 'run ended');
  const kinds = run.events.map((e: any) => e.k);
  assert.ok(kinds.includes('failed') || kinds.includes('errored'), 'starter must not pass');
  assert.equal(kinds.includes('passed') && !kinds.includes('failed'), false);
  const panel = world.panels.at(-1);
  const last = panel.posted.at(-1).state;
  assert.equal(last.progress.attempts, 1);
  assert.equal(last.progress.status, 'started');
  assert.ok(last.last && last.last.compiled);
  assert.equal(last.running, false);
  assert.equal(last.canReveal, false);
});

test('panel actions: hint, locked reveal', async () => {
  const panel = world.panels.at(-1);
  panel.receive({ type: 'hint' });
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(panel.posted.at(-1).state.progress.hintsUsed, 1);
  assert.equal(panel.posted.at(-1).state.exercise.hints.length, 1);
  const n = world.messages.length;
  panel.receive({ type: 'reveal' });
  await new Promise((r) => setTimeout(r, 20));
  assert.match(world.messages[n].text, /unlocks after/);
  panel.receive({ type: 'bogus' });
  panel.receive(null);
});

test('with the reference solution all tests pass, the learner is told, progress is saved', async () => {
  const sol = path.join(dojo, 'cpp', 'foundations', ID, 'solution.cpp');
  fs.writeFileSync(sol, fs.readFileSync(path.join(root, 'languages', 'cpp', 'reference', ID, 'solution.cpp'), 'utf8'));
  const n = world.messages.length;
  await cmd('dojo.runTests');
  const panel = world.panels.at(-1);
  const state = panel.posted.at(-1).state;
  assert.equal(state.progress.status, 'solved');
  assert.equal(state.last.passedAll, true);
  assert.ok(state.dueDays !== null);
  assert.match(world.messages[n]?.text ?? '', /all tests pass/);
  const saved = JSON.parse(fs.readFileSync(path.join(dojo, '.dojo', 'progress.json'), 'utf8'));
  assert.ok(JSON.stringify(saved).includes(ID));
  assert.match(world.statusBar[0].text, /1\/32/);
});

test('Run (own main) opens a terminal whose shell is the compiled binary', async () => {
  await cmd('dojo.run');
  const t = world.terminals.at(-1);
  assert.ok(t, 'terminal created');
  assert.ok(fs.existsSync(t.opts.shellPath), 'binary exists');
  assert.equal(t.opts.cwd, path.join(dojo, 'cpp', 'foundations', ID));
  t.dispose();
  assert.equal(fs.existsSync(t.opts.shellPath), false, 'binary removed when terminal closes');
});

test('compile errors become diagnostics on solution.cpp', async () => {
  const sol = path.join(dojo, 'cpp', 'foundations', ID, 'solution.cpp');
  const good = fs.readFileSync(sol, 'utf8');
  fs.writeFileSync(sol, good + '\nint broken() { return undefined_name; }\n');
  await cmd('dojo.runTests');
  const diags = world.diagnostics.get(Uri.file(sol).toString());
  assert.ok(diags && diags.length > 0, 'diagnostics published');
  assert.equal(world.panels.at(-1).posted.at(-1).state.last.compiled, false);
  fs.writeFileSync(sol, good);
});

test('reset archives the solution and restores the starter; practise again starts a review', async () => {
  const sol = path.join(dojo, 'cpp', 'foundations', ID, 'solution.cpp');
  await cmd('dojo.practiceAgain');
  const starter = fs.readFileSync(path.join(root, 'languages', 'cpp', 'exercises', 'foundations', ID, 'starter.cpp'), 'utf8');
  assert.equal(fs.readFileSync(sol, 'utf8'), starter);
  assert.ok(fs.readdirSync(path.join(dojo, 'cpp', 'foundations', ID, 'history')).length >= 1);
  const state = world.panels.at(-1).posted.at(-1).state;
  assert.equal(state.progress.status, 'reviewing');
  fs.writeFileSync(sol, starter + '\n// edit\n');
  await cmd('dojo.resetExercise');
  assert.equal(fs.readFileSync(sol, 'utf8'), starter);
  assert.ok(fs.readdirSync(path.join(dojo, 'cpp', 'foundations', ID, 'history')).length >= 2);
});

test('reveal unlocks after attempt + all hints and opens the read-only reference', async () => {
  const panel = world.panels.at(-1);
  await cmd('dojo.runTests');
  for (let i = 0; i < 3; i++) panel.receive({ type: 'hint' });
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(panel.posted.at(-1).state.canReveal, true);
  panel.receive({ type: 'reveal' });
  await new Promise((r) => setTimeout(r, 30));
  const shown = world.shownDocs.at(-1)!;
  assert.equal(shown.uri.scheme, 'dojo-reference');
  assert.equal(shown.column, -2);
  const text = world.documents.find((d) => d.uri.scheme === 'dojo-reference').getText();
  assert.match(text, /Reference solution/);
  assert.equal(panel.posted.at(-1).state.progress.revealed, true);
});

test('open next moves to another exercise and the panel follows', async () => {
  await cmd('dojo.openNext');
  const state = world.panels.at(-1).posted.at(-1).state;
  assert.notEqual(state.exercise.id, ID);
});

const GO_ID = 'f01-ints-and-overflow';
const goSolution = () => path.join(dojo, 'go', 'foundations', GO_ID, 'solution.go');
const hasGo = () => {
  const r = require('node:child_process').spawnSync('go', ['version'], { encoding: 'utf8' });
  return r.status === 0 && /go1\.(2[2-9]|[3-9]\d)/.test(r.stdout);
};

test('switching to Go swaps the path, status and Test Explorer, and leaves C++ progress alone', async () => {
  world.config.set('dojo.go.race', false); // skip the slow race-detector probe
  const cppExercise = world.panels.at(-1).posted.at(-1).state.exercise.id;
  await cmd('dojo.switchLanguage', 'go');
  assert.equal(world.contexts.get('dojo.language'), 'go');
  const tree = world.treeViews.find((t) => t.id === 'dojo.path').opts.treeDataProvider;
  const tracks = tree.getChildren();
  assert.deepEqual(tracks.map((t: any) => t.track.id), ['primer', 'foundations', 'graphs', 'matrices']);
  assert.equal(world.treeViews.find((t) => t.id === 'dojo.path').description, 'Go');
  assert.match(world.statusBar[0].text, /0\/42/);
  assert.match(world.statusBar[1].text, /Go/);
  assert.ok(world.controllers[0].items.get('track:primer'), 'Test Explorer lists the Go tracks');
  assert.equal(world.controllers[0].items.get('track:primer').children.size, 9);
  // No Go exercise has been opened yet, so nothing is opened for you and the panel asks you to pick one.
  assert.equal(world.contexts.get('dojo.inExercise'), false);
  assert.equal(world.panels.at(-1).posted.at(-1).state, null);
  assert.equal(world.panels.length > 0 && cppExercise !== GO_ID, true);
});

test('Go: opening an exercise writes solution.go; the panel and tutor know it is Go', { skip: !hasGo() && 'no Go toolchain' }, async () => {
  await cmd('dojo.openExercise', GO_ID);
  assert.ok(fs.existsSync(goSolution()), 'solution.go created');
  assert.equal(world.contexts.get('dojo.inExercise'), true);
  const state = world.panels.at(-1).posted.at(-1).state;
  assert.equal(state.exercise.language, 'Go');
  assert.equal(state.exercise.id, GO_ID);
  assert.equal(state.progress.status, 'new', 'C++ progress for the same id does not leak in');
  assert.ok(fs.readFileSync(goSolution(), 'utf8').includes('package main'));
});

test('Go: tests fail on the starter, pass with the reference, and record progress separately', { skip: !hasGo() && 'no Go toolchain' }, async () => {
  const before = world.runs.length;
  await cmd('dojo.runTests');
  const kinds = world.runs[before].events.map((e: any) => e.k);
  assert.ok(kinds.includes('failed'), 'starter must not pass');
  let state = world.panels.at(-1).posted.at(-1).state;
  assert.equal(state.progress.status, 'started');
  assert.ok(state.last.compiled);

  fs.writeFileSync(goSolution(), fs.readFileSync(path.join(root, 'languages', 'go', 'reference', GO_ID, 'solution.go'), 'utf8'));
  const n = world.messages.length;
  await cmd('dojo.runTests');
  const run = world.runs.at(-1);
  assert.ok(run.events.some((e: any) => e.k === 'passed' && e.id === `${GO_ID}::TestAddOverflowsOrdinaryValues`), 'child test items are matched by name');
  assert.ok(!run.events.some((e: any) => e.k === 'failed'));
  state = world.panels.at(-1).posted.at(-1).state;
  assert.equal(state.progress.status, 'solved');
  assert.match(world.messages[n]?.text ?? '', /all tests pass/);
  assert.match(world.statusBar[0].text, /1\/42/);
  const saved = JSON.parse(fs.readFileSync(path.join(dojo, '.dojo', 'progress.json'), 'utf8')).exercises;
  assert.ok(saved[`go:${GO_ID}`]?.solvedAt);
  assert.equal(saved[`go:${GO_ID}`].attempts, 2, "only the two Go runs count for Go");
  assert.ok(saved[`cpp:${GO_ID}`].attempts > 2, "the C++ entry with the same id keeps its own count");
});

test('Go: Run builds the scratch main into a terminal; compile errors become diagnostics', { skip: !hasGo() && 'no Go toolchain' }, async () => {
  await cmd('dojo.run');
  const t = world.terminals.at(-1);
  assert.ok(fs.existsSync(t.opts.shellPath), 'binary exists');
  assert.equal(t.opts.cwd, path.join(dojo, 'go', 'foundations', GO_ID));
  assert.equal(t.opts.env.GORACE, 'halt_on_error=1');
  t.dispose();
  assert.equal(fs.existsSync(t.opts.shellPath), false, 'binary removed when terminal closes');

  const good = fs.readFileSync(goSolution(), 'utf8');
  fs.writeFileSync(goSolution(), good + '\nfunc broken() int { return undefinedName }\n');
  await cmd('dojo.runTests');
  const diags = world.diagnostics.get(Uri.file(goSolution()).toString());
  assert.ok(diags && diags.length === 1 && /undefined/.test(diags[0].message), 'diagnostics published for solution.go');
  assert.equal(diags[0].source, 'go');
  assert.equal(world.panels.at(-1).posted.at(-1).state.last.compiled, false);
  fs.writeFileSync(goSolution(), good);
});

test('Go: the reference solution opens as a .go document', { skip: !hasGo() && 'no Go toolchain' }, async () => {
  const panel = world.panels.at(-1);
  for (let i = 0; i < 3; i++) panel.receive({ type: 'hint' });
  await new Promise((r) => setTimeout(r, 30));
  panel.receive({ type: 'reveal' });
  await new Promise((r) => setTimeout(r, 30));
  const shown = world.shownDocs.at(-1)!;
  assert.equal(shown.uri.scheme, 'dojo-reference');
  assert.match(shown.uri.path, /^\/go\/f01-ints-and-overflow\/reference-solution\.go$/);
  assert.match(world.documents.find((d) => d.uri.scheme === 'dojo-reference' && d.uri.path.startsWith('/go/')).getText(), /package main/);
});

test('switching back to C++ reopens the exercise you left, with its own progress', async () => {
  const goOpen = world.shownDocs.length;
  await cmd('dojo.switchLanguage', 'cpp');
  assert.equal(world.contexts.get('dojo.language'), 'cpp');
  const last = world.shownDocs.at(-1)!;
  assert.ok(world.shownDocs.length > goOpen, 'an editor was opened');
  assert.match(last.uri.fsPath, /[\\/]cpp[\\/]/);
  const state = world.panels.at(-1).posted.at(-1).state;
  assert.equal(state.exercise.language, 'C++');
  assert.notEqual(state.exercise.id, undefined);
  assert.match(world.statusBar[0].text, /\/32/);
  assert.match(world.statusBar[1].text, /C\+\+/);
});

test('switching language with no argument asks, and opening a Go file switches to Go by itself', { skip: !hasGo() && 'no Go toolchain' }, async () => {
  world.quickPickAnswer = (items) => items.find((i: any) => i.id === 'go');
  await cmd('dojo.switchLanguage');
  assert.equal(world.contexts.get('dojo.language'), 'go');
  await cmd('dojo.switchLanguage', 'cpp');

  // Focusing a Go solution file (for example from the Explorer) makes Go the language.
  const doc = await (require('vscode') as any).workspace.openTextDocument(Uri.file(goSolution()));
  await (require('vscode') as any).window.showTextDocument(doc, { viewColumn: 2 });
  await new Promise((r) => setTimeout(r, 30));
  assert.equal(world.contexts.get('dojo.language'), 'go');
  assert.equal(world.panels.at(-1).posted.at(-1).state.exercise.language, 'Go');
  await cmd('dojo.switchLanguage', 'cpp');
  world.quickPickAnswer = (items) => items[0];
});

test('tutor: init reports missing Ollama, then streams a reply and stores history', async () => {
  const origFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () => { throw new Error('refused'); }) as any;
    const provider = world.views.get('dojo.tutor');
    const posted: any[] = [];
    let handler: (m: any) => void = () => {};
    const view: any = {
      webview: { options: {}, html: '', cspSource: 'x', asWebviewUri: (u: Uri) => u, postMessage: async (m: any) => void posted.push(m), onDidReceiveMessage: (h: any) => { handler = h; return { dispose() {} }; } },
      onDidDispose: () => ({ dispose() {} }),
    };
    provider.resolveWebviewView(view);
    assert.match(view.webview.html, /tutor\.js/);
    handler({ type: 'ready' });
    await new Promise((r) => setTimeout(r, 30));
    const init = posted.find((m) => m.type === 'init');
    assert.ok(init.error, 'unreachable Ollama reported');
    assert.equal(init.exercise.id !== undefined, true);

    // Now a fake Ollama.
    let chatBody: any;
    globalThis.fetch = (async (url: string, init?: any) => {
      if (String(url).endsWith('/api/tags')) return new Response(JSON.stringify({ models: [{ name: 'tiny:1b' }] }));
      chatBody = JSON.parse(init.body);
      const enc = new TextEncoder();
      return new Response(new ReadableStream({
        start(c) {
          c.enqueue(enc.encode(JSON.stringify({ message: { content: 'Think ' } }) + '\n'));
          c.enqueue(enc.encode(JSON.stringify({ message: { content: 'about it.' } }) + '\n' + JSON.stringify({ done: true }) + '\n'));
          c.close();
        },
      }));
    }) as any;
    posted.length = 0;
    handler({ type: 'send', text: 'I am stuck', share: true });
    await new Promise((r) => setTimeout(r, 200));
    assert.deepEqual(posted.filter((m) => m.type === 'delta').map((m) => m.text).join(''), 'Think about it.');
    assert.equal(posted.at(-1).type, 'done');
    assert.equal(chatBody.model, 'tiny:1b');
    assert.match(chatBody.messages[0].content, /Current exercise/);
    assert.match(chatBody.messages[0].content, /current code/);
    // history persisted per exercise
    posted.length = 0;
    handler({ type: 'ready' });
    await new Promise((r) => setTimeout(r, 30));
    const again = posted.find((m) => m.type === 'init');
    assert.equal(again.history.length, 2);
    assert.equal(again.model, 'tiny:1b');
    handler({ type: 'setMode', mode: 'code' });
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(world.config.get('dojo.tutor.mode'), 'code');
    handler({ type: 'clear' });
    await new Promise((r) => setTimeout(r, 10));
    assert.deepEqual(posted.at(-1).history, []);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test('practice mode needs the dojo folder open, then writes and clears folder settings', async () => {
  await cmd('dojo.togglePracticeMode');
  assert.match(world.messages.at(-1)!.text, /needs to be the one open/);
  world.folders = [{ uri: Uri.file(dojo), name: 'dojo', index: 0 }];
  await cmd('dojo.togglePracticeMode');
  assert.equal(world.config.get('editor.suggestOnTriggerCharacters'), false);
  await cmd('dojo.togglePracticeMode');
  assert.equal(world.config.has('editor.suggestOnTriggerCharacters'), false);
});

test('disposing the extension cleans up', () => {
  for (const d of ctx.subscriptions) d.dispose();
});
