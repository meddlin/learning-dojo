import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { test } from 'node:test';
import { Catalogs } from '../src/core/catalog';
import { detectCpp, runCppTests } from '../src/core/cpp';
import { parseCompilerOutput, parseGoOutput } from '../src/core/diagnostics';
import { detectGo, runGoTests } from '../src/core/go';
import { goTestNames, parseTestRun, prettyName, testMessage } from '../src/core/goOutput';
import { CPP, GO } from '../src/core/languages';
import { LanguageProgress, ProgressStore, REVIEW_DAYS } from '../src/core/progress';
import { BACKENDS, DEFAULT_SETTINGS, ToolchainProvider } from '../src/core/toolchain';
import { WorkDir } from '../src/core/workdir';
import { buildMessages, ollamaBase, streamChat, listModels } from '../src/core/tutor';

const catalogs = new Catalogs(path.resolve(__dirname, '..', 'languages'));
const catalog = catalogs.get('cpp');
const goCatalog = catalogs.get('go');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'dojo-test-'));

test('catalog (C++): three tracks, 32 exercises, unique ids, enough hints', () => {
  assert.deepEqual(catalog.tracks().map((t) => t.id), ['foundations', 'graphs', 'matrices']);
  const all = catalog.all();
  assert.equal(all.length, 32);
  assert.equal(new Set(all.map((e) => e.id)).size, all.length);
  for (const e of all) {
    assert.ok(e.hints.length >= 3, `${e.id} hints`);
    assert.ok(catalog.testNames(e).length > 0, `${e.id} has tests`);
    assert.ok(catalog.reference(e), `${e.id} has a reference`);
  }
});

test('catalog (Go): four tracks, 42 exercises, each with a starter, tests and a reference', () => {
  assert.deepEqual(goCatalog.tracks().map((t) => t.id), ['primer', 'foundations', 'graphs', 'matrices']);
  const all = goCatalog.all();
  assert.equal(all.length, 42);
  assert.equal(new Set(all.map((e) => e.id)).size, all.length);
  for (const e of all) {
    assert.equal(e.language, 'go');
    assert.ok(e.hints.length >= 3, `${e.id} hints`);
    assert.ok(goCatalog.testNames(e).length > 0, `${e.id} has tests`);
    assert.ok(goCatalog.reference(e), `${e.id} has a reference`);
    assert.ok(goCatalog.starter(e).includes('package main'), `${e.id} starter`);
  }
});

test('catalogs: C++ and Go share ids but never mix exercises', () => {
  const shared = catalog.all().map((e) => e.id).filter((id) => goCatalog.find(id));
  assert.ok(shared.includes('g01-adjacency-list'), 'the graph exercises have the same ids in both languages');
  assert.notEqual(catalog.starter(catalog.find('g01-adjacency-list')!), goCatalog.starter(goCatalog.find('g01-adjacency-list')!));
  assert.equal(catalogs.of(goCatalog.find('g01-adjacency-list')!), goCatalog);
});

test('catalog: find rejects odd ids and nextAfter wraps', () => {
  assert.equal(catalog.find('../etc/passwd'), undefined);
  assert.equal(catalog.find('f01-ints-and-overflow')?.track, 'foundations');
  const last = catalog.all().at(-1)!;
  assert.equal(catalog.nextAfter(last.id, () => true)?.id, catalog.all()[0].id);
});

test('catalog: testNames reads C++ TEST() cases and Go Test functions in order', () => {
  const names = catalog.testNames(catalog.find('g02-bfs-order')!);
  assert.equal(names[0], 'bfs_on_a_path');
  assert.ok(names.includes('bfs_single_vertex'));
  const goNames = goCatalog.testNames(goCatalog.find('f01-ints-and-overflow')!);
  assert.equal(goNames[0], 'TestAddOverflowsOrdinaryValues');
  assert.equal(GO.resultName(goNames[0]), 'add overflows ordinary values');
  assert.equal(CPP.resultName('bfs_on_a_path'), 'bfs_on_a_path');
});

test('workdir: scaffolds, archives and recognises exercise files', () => {
  const root = tmp();
  const wd = new WorkDir(root, catalogs);
  wd.init();
  assert.ok(fs.existsSync(path.join(root, '.dojo', '.gitignore')));
  const ex = catalog.find('g01-adjacency-list')!;
  const file = wd.ensureSolution(ex);
  assert.equal(file, path.join(root, 'cpp', 'graphs', 'g01-adjacency-list', 'solution.cpp'));
  assert.equal(fs.readFileSync(file, 'utf8'), catalog.starter(ex));
  assert.equal(wd.exerciseForFile(file)?.id, ex.id);
  assert.equal(wd.exerciseForFile(path.join(root, 'cpp', 'graphs', 'g01-adjacency-list', 'notes.cpp')), undefined);
  assert.equal(wd.exerciseForFile(path.join(root, 'cpp', 'graphs', 'g01-adjacency-list', 'solution.go')), undefined);
  assert.equal(wd.exerciseForFile(path.join(root, 'graphs', 'g01-adjacency-list', 'solution.cpp')), undefined);
  assert.equal(wd.exerciseForFile(path.join(root, '..', 'x', 'solution.cpp')), undefined);

  // The same exercise id in Go lives in its own folder and is recognised as Go.
  const goEx = goCatalog.find('g01-adjacency-list')!;
  const goFile = wd.ensureSolution(goEx);
  assert.equal(goFile, path.join(root, 'go', 'graphs', 'g01-adjacency-list', 'solution.go'));
  assert.equal(fs.readFileSync(goFile, 'utf8'), goCatalog.starter(goEx));
  assert.equal(wd.exerciseForFile(goFile)?.language, 'go');
  assert.equal(wd.exerciseForFile(file)?.language, 'cpp');
  wd.writeCode(goEx, '// go attempt\n');
  wd.archiveAndReset(goEx);
  assert.ok(fs.readdirSync(path.join(wd.dirOf(goEx), 'history'))[0].endsWith('.go'));
  assert.equal(fs.readFileSync(file, 'utf8'), catalog.starter(ex), 'the C++ file is untouched');

  // Archives made in quick succession never overwrite each other.
  for (const text of ['// one\n', '// two\n', '// three\n']) {
    wd.writeCode(goEx, text);
    wd.archiveAndReset(goEx);
  }
  assert.equal(fs.readdirSync(path.join(wd.dirOf(goEx), 'history')).length, 4);

  // Resetting an untouched starter archives nothing; a changed file is archived.
  wd.archiveAndReset(ex);
  assert.ok(!fs.existsSync(path.join(wd.dirOf(ex), 'history')));
  wd.writeCode(ex, '// my attempt\n');
  wd.archiveAndReset(ex);
  const hist = fs.readdirSync(path.join(wd.dirOf(ex), 'history'));
  assert.equal(hist.length, 1);
  assert.equal(fs.readFileSync(path.join(wd.dirOf(ex), 'history', hist[0]), 'utf8'), '// my attempt\n');
  assert.equal(wd.readCode(ex), catalog.starter(ex));
  fs.rmSync(root, { recursive: true, force: true });
});

test('progress: solve, schedule reviews, review again', () => {
  const root = tmp();
  let now = Date.parse('2026-01-01T12:00:00Z');
  const store = new ProgressStore(path.join(root, '.dojo', 'progress.json'), () => now);
  assert.equal(store.view('a').status, 'new');
  assert.equal(store.recordTestRun('a', false).status, 'started');
  const solved = store.recordTestRun('a', true);
  assert.equal(solved.status, 'solved');
  assert.equal(Date.parse(solved.dueAt!) - now, REVIEW_DAYS[0] * 86400000);

  now += 2 * 86400000;
  assert.equal(store.view('a').status, 'review-due');
  assert.ok(store.startReview('a'));
  assert.equal(store.view('a').status, 'reviewing');
  const again = store.recordTestRun('a', true);
  assert.equal(again.status, 'solved');
  assert.equal(again.reviewCount, 1);
  assert.equal(Date.parse(again.dueAt!) - now, REVIEW_DAYS[1] * 86400000);

  // Persisted to disk and readable by a fresh store.
  const fresh = new ProgressStore(store.file, () => now);
  assert.equal(fresh.view('a').reviewCount, 1);
  fs.rmSync(root, { recursive: true, force: true });
});

test('progress: languages keep separate entries for the same exercise id', () => {
  const root = tmp();
  const store = new ProgressStore(path.join(root, 'p.json'));
  const cpp = new LanguageProgress(store, 'cpp');
  const go = new LanguageProgress(store, 'go');
  cpp.recordTestRun('g01-adjacency-list', true);
  assert.equal(cpp.view('g01-adjacency-list').status, 'solved');
  assert.equal(go.view('g01-adjacency-list').status, 'new');
  go.useHint('g01-adjacency-list', 3);
  assert.equal(go.view('g01-adjacency-list').status, 'started');
  assert.equal(cpp.view('g01-adjacency-list').hintsUsed, 0);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(store.file, 'utf8')).exercises).sort(), ['cpp:g01-adjacency-list', 'go:g01-adjacency-list']);
  fs.rmSync(root, { recursive: true, force: true });
});

test('progress: hints are handed out once each; reveal shortens the next review', () => {
  const root = tmp();
  const now = Date.parse('2026-01-01T00:00:00Z');
  const store = new ProgressStore(path.join(root, 'p.json'), () => now);
  assert.equal(store.useHint('x', 2), 0);
  assert.equal(store.useHint('x', 2), 1);
  assert.equal(store.useHint('x', 2), null);
  store.markRevealed('x');
  const v = store.recordTestRun('x', true);
  assert.equal(Date.parse(v.dueAt!) - now, 86400000);
  assert.equal(store.startReview('never-solved'), null);
  fs.rmSync(root, { recursive: true, force: true });
});

test('progress: survives a corrupt file', () => {
  const root = tmp();
  const file = path.join(root, 'p.json');
  fs.writeFileSync(file, '{not json');
  const store = new ProgressStore(file);
  assert.equal(store.view('a').status, 'new');
  store.recordTestRun('a', false);
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).exercises.a.attempts, 1);
  fs.rmSync(root, { recursive: true, force: true });
});

test('diagnostics: parses gcc and clang messages for solution.cpp only', () => {
  const out = [
    '$ g++ -std=c++20 test.cpp',
    "/tmp/x/solution.cpp:12:5: error: use of undeclared identifier 'foo'",
    "/tmp/x/solution.cpp:12:5: note: did you mean 'bar'?",
    '\x1b[01m\x1b[K/tmp/x/solution.cpp:20:3:\x1b[m\x1b[K \x1b[01;35m\x1b[Kwarning: \x1b[m\x1b[Kunused variable',
    '/opt/dojo/test.cpp:3:1: error: something in the tests',
    'C:\\dojo\\solution.cpp:7:1: fatal error: x.h: No such file or directory',
  ].join('\n');
  const d = parseCompilerOutput(out);
  assert.deepEqual(
    d.map((x) => [x.line, x.column, x.severity]),
    [
      [12, 5, 'error'],
      [20, 3, 'warning'],
      [7, 1, 'error'],
    ],
  );
  assert.match(d[0].message, /did you mean 'bar'/);
});

test('diagnostics: parses go build messages for solution.go only', () => {
  const out = [
    '# dojo',
    './solution.go:12:5: undefined: foo',
    './solution.go:15:2: x redeclared in this block',
    '\t./solution.go:14:2: other declaration of x',
    './solution_test.go:3:1: syntax error in the tests',
    'solution.go:7:2: "os" imported and not used',
  ].join('\n');
  const d = parseGoOutput(out);
  assert.deepEqual(d.map((x) => [x.line, x.column, x.severity]), [[12, 5, 'error'], [15, 2, 'error'], [7, 2, 'error']]);
  assert.match(d[1].message, /other declaration of x/);
});

test('go output: names, test discovery, failure messages and crashes', () => {
  assert.equal(prettyName('TestBFSOnAPath'), 'bfs on a path');
  assert.equal(prettyName('Test_union_find'), 'union find');
  assert.deepEqual(goTestNames('func TestA(t *testing.T) {}\nfunc helper() {}\nfunc TestB_two(tt *testing.T) {}'), ['TestA', 'TestB_two']);

  const failing = ['=== RUN   TestA', '    solution_test.go:12: ', '        expected: 3', '          actual: 4', '--- FAIL: TestA (0.00s)', '=== RUN   TestB', '--- PASS: TestB (0.00s)', 'FAIL'].join('\n');
  const parsed = parseTestRun(failing);
  assert.deepEqual(parsed.done.map((t) => [t.name, t.ok]), [['TestA', false], ['TestB', true]]);
  assert.equal(parsed.crashed, null);
  assert.equal(testMessage(parsed.done[0].lines.join('\n'), '/tmp/b'), '    at solution_test.go:12\n    expected: 3\n      actual: 4');

  const crashed = parseTestRun(['=== RUN   TestA', '--- PASS: TestA (0.00s)', '=== RUN   TestB', 'panic: runtime error: index out of range [3] with length 3', '', 'goroutine 7 [running]:'].join('\n'));
  assert.deepEqual(crashed.done.map((t) => t.name), ['TestA']);
  assert.equal(crashed.crashed?.name, 'TestB');
  assert.match(crashed.crashed!.lines.join('\n'), /index out of range/);

  const hung = parseTestRun('=== RUN   TestSlow\n');
  assert.equal(hung.crashed?.name, 'TestSlow');
});

test('tutor: base URL resolution', () => {
  assert.equal(ollamaBase('', {}), 'http://127.0.0.1:11434');
  assert.equal(ollamaBase('http://box:1234/', {}), 'http://box:1234');
  assert.equal(ollamaBase('', { OLLAMA_HOST: '10.0.0.5:11434' }), 'http://10.0.0.5:11434');
  assert.equal(ollamaBase('', { OLLAMA_URL: 'https://o.example/' , OLLAMA_HOST: 'ignored' }), 'https://o.example');
});

test('tutor: messages carry the mode, exercise, code and output; history is trimmed', () => {
  const history = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? ('assistant' as const) : ('user' as const), content: `m${i}` }));
  const msgs = buildMessages(history, { language: CPP, title: 'BFS', prompt: 'Do the thing', mode: 'socratic', code: 'int main(){}', output: 'boom' });
  assert.equal(msgs[0].role, 'system');
  assert.match(msgs[0].content, /SOCRATIC/);
  assert.match(msgs[0].content, /Current exercise: BFS/);
  assert.match(msgs[0].content, /int main\(\)\{\}/);
  assert.match(msgs[0].content, /boom/);
  assert.equal(msgs.length, 13);
  assert.equal(msgs.at(-1)!.content, 'm29');
  assert.match(buildMessages([], { language: CPP, title: 't', prompt: 'p', mode: 'code' })[0].content, /SHOW-CODE/);
});

test('tutor: the prompt speaks about the exercise language', () => {
  const cpp = buildMessages([], { language: CPP, title: 't', prompt: 'p', mode: 'explain', code: 'x' })[0].content;
  assert.match(cpp, /C and C\+\+/);
  assert.match(cpp, /undefined behaviour/);
  assert.match(cpp, /```cpp/);
  const go = buildMessages([], { language: GO, title: 't', prompt: 'p', mode: 'explain', code: 'x' })[0].content;
  assert.match(go, /Go programming language/);
  assert.match(go, /slices vs arrays/);
  assert.match(go, /```go/);
  assert.doesNotMatch(go, /undefined behaviour/);
  assert.doesNotMatch(go, /\{\{connect\}\}/);
});

function ndjson(lines: object[], status = 200): Response {
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      // Split mid-line to exercise the buffering.
      const all = lines.map((l) => JSON.stringify(l)).join('\n') + '\n';
      c.enqueue(enc.encode(all.slice(0, 20)));
      c.enqueue(enc.encode(all.slice(20)));
      c.close();
    },
  });
  return new Response(body, { status });
}

test('tutor: streams deltas, reports errors, lists models', async () => {
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (url: string | URL | Request) => {
      const u = String(url);
      if (u.endsWith('/api/tags')) return new Response(JSON.stringify({ models: [{ name: 'a:1' }, { name: 'b:2' }] }));
      return ndjson([{ message: { content: 'Hel' } }, { message: { content: 'lo' } }, { done: true }]);
    }) as typeof fetch;
    let got = '';
    const err = await streamChat({ base: 'http://x', model: 'm', messages: [], onDelta: (d) => (got += d) });
    assert.equal(err, undefined);
    assert.equal(got, 'Hello');
    assert.deepEqual(await listModels('http://x'), { ok: true, models: ['a:1', 'b:2'] });

    globalThis.fetch = (async () => new Response(JSON.stringify({ error: 'model not found' }), { status: 404 })) as typeof fetch;
    assert.match((await streamChat({ base: 'http://x', model: 'm', messages: [], onDelta: () => undefined }))!, /model not found/);

    globalThis.fetch = (async () => {
      throw new Error('ECONNREFUSED');
    }) as typeof fetch;
    assert.match((await streamChat({ base: 'http://x', model: 'm', messages: [], onDelta: () => undefined }))!, /Could not reach Ollama/);
    assert.equal((await listModels('http://x')).ok, false);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('runner (C++): starter fails, reference passes, compile errors are reported, loops time out', async () => {
  const tc = await detectCpp(process.env.CXX ?? '');
  if (!tc.cmd) return; // no compiler on this machine
  const root = tmp();
  const ex = catalog.find('f01-ints-and-overflow')!;
  const common = { tc, testFile: catalog.testFile(ex), includeDir: catalog.includeDir, buildDir: path.join(root, 'build'), color: false };

  const starterDir = path.join(root, 'starter');
  fs.mkdirSync(starterDir);
  fs.writeFileSync(path.join(starterDir, 'solution.cpp'), catalog.starter(ex));
  const s = await runCppTests({ ...common, solutionDir: starterDir, tag: 's' });
  assert.ok(s.compiled);
  assert.ok(!s.passedAll);
  assert.ok(s.results && s.results.failed > 0);

  const r = await runCppTests({ ...common, solutionDir: catalog.referenceDir(ex), tag: 'r' });
  assert.ok(r.passedAll, r.output);
  assert.equal(r.results?.failed, 0);

  const badDir = path.join(root, 'bad');
  fs.mkdirSync(badDir);
  fs.writeFileSync(path.join(badDir, 'solution.cpp'), 'int broken() { return undefined_name; }\n');
  const bad = await runCppTests({ ...common, solutionDir: badDir, tag: 'b' });
  assert.ok(!bad.compiled);
  assert.ok(parseCompilerOutput(bad.output).length > 0);

  // An infinite loop is stopped by the timeout.
  const loopDir = path.join(root, 'loop');
  fs.mkdirSync(loopDir);
  fs.writeFileSync(path.join(loopDir, 'solution.cpp'), fs.readFileSync(path.join(catalog.referenceDir(ex), 'solution.cpp'), 'utf8').replace(/(\n[^\n]*\{)/, '$1 for(;;){}'));
  const t = await runCppTests({ ...common, solutionDir: loopDir, tag: 'l', timeoutMs: 1500 });
  if (t.compiled) assert.ok(t.timedOut || t.signal || !t.passedAll);

  // Build products are cleaned up.
  assert.deepEqual(fs.readdirSync(path.join(root, 'build')), []);
  fs.rmSync(root, { recursive: true, force: true });
});

test('runner (C++): cancelling kills the test program', async () => {
  const tc = await detectCpp(process.env.CXX ?? '');
  if (!tc.cmd) return;
  const root = tmp();
  const ex = catalog.find('f01-ints-and-overflow')!;
  const dir = path.join(root, 'spin');
  fs.mkdirSync(dir);
  const ref = fs.readFileSync(path.join(catalog.referenceDir(ex), 'solution.cpp'), 'utf8');
  fs.writeFileSync(path.join(dir, 'solution.cpp'), `#include <thread>\n#include <chrono>\nstruct Spin { Spin() { for (;;) std::this_thread::sleep_for(std::chrono::seconds(1)); } } spin_;\n${ref}`);
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), 2500);
  const started = Date.now();
  const res = await runCppTests({ tc, solutionDir: dir, testFile: catalog.testFile(ex), includeDir: catalog.includeDir, buildDir: path.join(root, 'build'), tag: 'c', color: false, signal: ctl.signal, timeoutMs: 20_000 });
  assert.ok(Date.now() - started < 15_000);
  assert.ok(res.cancelled || !res.compiled);
  fs.rmSync(root, { recursive: true, force: true });
});

test('runner (Go): starter fails, reference passes, compile errors are located, hangs and panics are contained', async () => {
  const tc = await detectGo(process.env.GO ?? '', false);
  if (!tc.cmd) return; // no Go toolchain on this machine
  const root = tmp();
  const ex = goCatalog.find('f01-ints-and-overflow')!;
  const common = { tc, testFile: goCatalog.testFile(ex), includeDir: goCatalog.includeDir, buildDir: path.join(root, 'build'), color: false };
  const dirWith = (name: string, code: string) => {
    const dir = path.join(root, name);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, 'solution.go'), code);
    return dir;
  };

  const s = await runGoTests({ ...common, solutionDir: dirWith('starter', goCatalog.starter(ex)), tag: 's' });
  assert.ok(s.compiled, s.output);
  assert.ok(!s.passedAll);
  assert.ok(s.results && s.results.failed > 0);
  assert.equal(s.results.tests[0].name, GO.resultName(goCatalog.testNames(ex)[0]));
  assert.match(s.results.tests.find((t) => !t.ok)!.message, /solution_test\.go:\d+/);

  const r = await runGoTests({ ...common, solutionDir: goCatalog.referenceDir(ex), tag: 'r' });
  assert.ok(r.passedAll, r.output);
  assert.equal(r.results?.failed, 0);
  assert.equal(r.results?.total, goCatalog.testNames(ex).length);

  const bad = await runGoTests({ ...common, solutionDir: dirWith('bad', goCatalog.starter(ex) + '\nfunc broken() int { return undefinedName }\n'), tag: 'b' });
  assert.ok(!bad.compiled);
  const located = parseGoOutput(bad.output);
  assert.equal(located.length, 1);
  assert.match(located[0].message, /undefined: undefinedName/);

  // A panic and a hang in one test are reported for that test; the rest still run.
  const ref = fs.readFileSync(path.join(goCatalog.referenceDir(ex), 'solution.go'), 'utf8');
  const names = goCatalog.testNames(ex);
  const panicky = await runGoTests({ ...common, solutionDir: dirWith('panic', ref.replace(/(func AddOverflows[^\n]*\n)/, '$1\tvar p *int\n\t_ = *p\n')), tag: 'p' });
  assert.ok(panicky.compiled && !panicky.passedAll, panicky.output);
  assert.equal(panicky.results?.total, names.length);
  assert.ok(panicky.results!.tests.some((t) => !t.ok && /nil pointer/.test(t.message)), panicky.output);
  assert.ok(panicky.results!.tests.some((t) => t.ok), 'tests that do not touch the broken function still pass');

  const hung = await runGoTests({ ...common, solutionDir: dirWith('hang', ref.replace(/(func AddOverflows[^\n]*\n)/, '$1\tfor {\n\t}\n')), tag: 'h', timeoutMs: 1500 });
  assert.ok(hung.timedOut && !hung.passedAll, hung.output);
  assert.ok(hung.results!.tests.some((t) => !t.ok && /timed out/.test(t.message)));
  assert.equal(hung.results!.total, names.length);

  assert.deepEqual(fs.readdirSync(path.join(root, 'build')), [], 'build products are cleaned up');
  fs.rmSync(root, { recursive: true, force: true });
});

test('runner (Go): the scratch main builds into a program, and cancelling stops the tests', async () => {
  const tc = await detectGo(process.env.GO ?? '', false);
  if (!tc.cmd) return;
  const root = tmp();
  const ex = goCatalog.find('f01-ints-and-overflow')!;
  const built = await BACKENDS.go.build({ tc, kind: 'run', solutionDir: goCatalog.referenceDir(ex), includeDir: goCatalog.includeDir, outFile: path.join(root, 'out', 'prog'), color: false });
  assert.ok(built.ok, built.output);
  assert.ok(fs.existsSync(path.join(root, 'out', 'prog')));
  assert.deepEqual(fs.readdirSync(path.join(root, 'out')), ['prog'], 'the throw-away module is removed');

  const dir = path.join(root, 'spin');
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'solution.go'), fs.readFileSync(path.join(goCatalog.referenceDir(ex), 'solution.go'), 'utf8').replace(/(func AddOverflows[^\n]*\n)/, '$1\tfor {\n\t}\n'));
  const ctl = new AbortController();
  setTimeout(() => ctl.abort(), 2500);
  const started = Date.now();
  const res = await runGoTests({ tc, solutionDir: dir, testFile: goCatalog.testFile(ex), includeDir: goCatalog.includeDir, buildDir: path.join(root, 'build'), tag: 'c', color: false, signal: ctl.signal, timeoutMs: 20_000 });
  assert.ok(Date.now() - started < 15_000);
  assert.ok(res.cancelled);
  assert.ok(!res.passedAll);
  fs.rmSync(root, { recursive: true, force: true });
});

test('toolchain provider: detection is cached per language and settings, and reset forgets it', async () => {
  const tp = new ToolchainProvider();
  const a = tp.get('go', { ...DEFAULT_SETTINGS, goRace: false });
  assert.equal(a, tp.get('go', { ...DEFAULT_SETTINGS, goRace: false }));
  assert.notEqual(a, tp.get('go', { ...DEFAULT_SETTINGS, goRace: true }));
  assert.notEqual(a, tp.get('cpp', DEFAULT_SETTINGS));
  await a;
  tp.reset();
  assert.notEqual(a, tp.get('go', { ...DEFAULT_SETTINGS, goRace: false }));
});
