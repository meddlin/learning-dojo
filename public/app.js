import { md, stripAnsi } from '/render.js';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  },
};

const state = {
  tracks: [],
  current: null,
  monaco: null,
  editor: null,
  models: new Map(),
  term: null,
  fit: null,
  ws: null,
  running: null,
  lastOutput: '',
  lastResults: new Map(),
  saveTimer: null,
  chat: { mode: 'socratic', model: '', models: [], busy: false, controller: null, byExercise: {} },
};

// ---------------------------------------------------------------------------
// layout: resizable panes
// ---------------------------------------------------------------------------

function setupSplitter(el, { cssVar, axis, min, max, invert }) {
  const root = document.documentElement;
  const saved = store.get(`dojo.layout.${cssVar}`, null);
  if (saved) root.style.setProperty(cssVar, `${saved}px`);

  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    const start = axis === 'x' ? e.clientX : e.clientY;
    const startSize = parseFloat(getComputedStyle(root).getPropertyValue(cssVar));
    const move = (ev) => {
      const delta = (axis === 'x' ? ev.clientX : ev.clientY) - start;
      const size = Math.min(max(), Math.max(min, startSize + (invert ? -delta : delta)));
      root.style.setProperty(cssVar, `${Math.round(size)}px`);
    };
    const up = () => {
      el.classList.remove('dragging');
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      store.set(`dojo.layout.${cssVar}`, parseFloat(getComputedStyle(root).getPropertyValue(cssVar)));
      fitTerminal();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
  });
}

function setupLayout() {
  setupSplitter($('#split-left'), { cssVar: '--left', axis: 'x', min: 260, max: () => window.innerWidth * 0.5 });
  setupSplitter($('#split-right'), { cssVar: '--right', axis: 'x', min: 280, max: () => window.innerWidth * 0.5, invert: true });
  setupSplitter($('#split-term'), { cssVar: '--term', axis: 'y', min: 90, max: () => window.innerHeight * 0.7, invert: true });
}

// ---------------------------------------------------------------------------
// Monaco editor
// ---------------------------------------------------------------------------

function loadMonaco() {
  return new Promise((resolve, reject) => {
    if (!window.require) return reject(new Error('The editor library did not load. Did you run npm install?'));
    window.require.config({ paths: { vs: '/vendor/monaco/vs' } });
    window.require(['vs/editor/editor.main'], () => resolve(window.monaco), reject);
  });
}

function suggestOptions(on) {
  return {
    quickSuggestions: on,
    suggestOnTriggerCharacters: on,
    wordBasedSuggestions: on ? 'currentDocument' : 'off',
    parameterHints: { enabled: on },
    acceptSuggestionOnEnter: on ? 'on' : 'off',
    tabCompletion: 'off',
    inlineSuggest: { enabled: false },
  };
}

function setupEditor(monaco) {
  monaco.editor.defineTheme('dojo', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0f1115',
      'editorGutter.background': '#0f1115',
      'editor.lineHighlightBackground': '#161b26',
      'editorLineNumber.foreground': '#4a5266',
    },
  });
  const suggest = store.get('dojo.suggest', false);
  $('#opt-suggest').checked = suggest;
  state.editor = monaco.editor.create($('#editor'), {
    theme: 'dojo',
    language: 'cpp',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'SF Mono, ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace',
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: 'none',
    padding: { top: 10 },
    smoothScrolling: true,
    ...suggestOptions(suggest),
  });
  $('#opt-suggest').addEventListener('change', (e) => {
    store.set('dojo.suggest', e.target.checked);
    state.editor.updateOptions(suggestOptions(e.target.checked));
  });
  state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => startJob('test'));
  state.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => startJob('run'));
}

function setSaveState(text) {
  $('#save-state').textContent = text;
}

function onEdit(id) {
  setSaveState('Editing…');
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => saveCode(id), 700);
}

async function saveCode(id) {
  clearTimeout(state.saveTimer);
  state.saveTimer = null;
  const model = state.models.get(id);
  if (!model) return;
  try {
    await api('PUT', `/api/exercise/${id}/code`, { code: model.getValue() });
    setSaveState('Saved');
  } catch {
    setSaveState('Not saved');
  }
}

async function flushSave() {
  if (state.saveTimer && state.current) await saveCode(state.current.id);
}

window.addEventListener('pagehide', () => {
  if (!state.saveTimer || !state.current) return;
  const model = state.models.get(state.current.id);
  if (model) {
    fetch(`/api/exercise/${state.current.id}/code`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: model.getValue() }),
      keepalive: true,
    });
  }
});

// ---------------------------------------------------------------------------
// terminal and WebSocket
// ---------------------------------------------------------------------------

function setupTerminal() {
  const term = new window.Terminal({
    convertEol: true,
    cursorBlink: true,
    fontSize: 13,
    fontFamily: 'SF Mono, ui-monospace, Menlo, Consolas, "DejaVu Sans Mono", monospace',
    scrollback: 5000,
    theme: {
      background: '#0b0d12',
      foreground: '#d7dce5',
      cursor: '#d7dce5',
      selectionBackground: '#2a3a66',
      black: '#1b2130',
      red: '#f7768e',
      green: '#7bd88f',
      yellow: '#e0af68',
      blue: '#7aa2f7',
      magenta: '#bb9af7',
      cyan: '#7dcfff',
      white: '#c0caf5',
      brightBlack: '#565f89',
      brightRed: '#ff9eaf',
      brightGreen: '#9ee6ae',
      brightYellow: '#f0c987',
      brightBlue: '#9db8ff',
      brightMagenta: '#cdb4ff',
      brightCyan: '#a3e1ff',
      brightWhite: '#e6ebff',
    },
  });
  const fit = new window.FitAddon.FitAddon();
  term.loadAddon(fit);
  term.open($('#terminal'));
  state.term = term;
  state.fit = fit;
  new ResizeObserver(() => fitTerminal()).observe($('#terminal'));
  fitTerminal();

  term.writeln('\x1b[2mPress "Run tests" (Ctrl/Cmd+Enter) to check your solution, or "Run" to execute your own main().\x1b[0m');

  // There is no pseudo-terminal behind this, so line editing happens here.
  let line = '';
  term.onData((data) => {
    if (state.running !== 'run') return;
    for (const ch of data) {
      if (ch === '\r' || ch === '\n') {
        term.write('\r\n');
        wsSend({ type: 'stdin', data: `${line}\n` });
        line = '';
      } else if (ch === '\x7f') {
        if (line) {
          line = line.slice(0, -1);
          term.write('\b \b');
        }
      } else if (ch === '\x03') {
        line = '';
        term.write('^C\r\n');
        stopJob();
      } else if (ch === '\x04') {
        wsSend({ type: 'stdin-end' });
      } else if (ch >= ' ') {
        line += ch;
        term.write(ch);
      }
    }
  });
}

function fitTerminal() {
  if (!state.fit) return;
  requestAnimationFrame(() => {
    try {
      state.fit.fit();
    } catch {
      /* the terminal is not visible yet */
    }
  });
}

function wsSend(obj) {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(obj));
}

function ensureWs() {
  if (state.ws && state.ws.readyState === WebSocket.OPEN) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    state.ws = ws;
    ws.addEventListener('open', () => resolve());
    ws.addEventListener('error', () => reject(new Error('Could not connect to the Dojo server.')));
    ws.addEventListener('message', (e) => onWsMessage(JSON.parse(e.data)));
    ws.addEventListener('close', () => {
      if (state.ws === ws) state.ws = null;
      if (state.running) {
        state.term.writeln('\r\n\x1b[31mLost the connection to the Dojo server.\x1b[0m');
        state.running = null;
        renderToolbar();
      }
    });
  });
}

function onWsMessage(msg) {
  if (msg.type === 'out') {
    state.term.write(msg.data);
    state.lastOutput = (state.lastOutput + stripAnsi(msg.data)).slice(-6000);
  } else if (msg.type === 'phase') {
    setSaveState({ compiling: 'Compiling…', testing: 'Testing…', running: 'Running…' }[msg.phase] || '');
  } else if (msg.type === 'error') {
    state.term.writeln(`\r\n\x1b[31m${msg.message}\x1b[0m`);
    state.running = null;
    renderToolbar();
  } else if (msg.type === 'done') {
    state.running = null;
    setSaveState('Saved');
    updateProgress(msg.exerciseId, msg.progress);
    if (msg.mode === 'test') {
      state.lastResults.set(msg.exerciseId, msg);
      if (state.current && state.current.id === msg.exerciseId) renderResults();
    }
    renderToolbar();
  }
}

async function startJob(kind) {
  if (state.running || !state.current || !state.editor) return;
  try {
    await ensureWs();
  } catch (e) {
    state.term.writeln(`\x1b[31m${e.message}\x1b[0m`);
    return;
  }
  state.running = kind;
  state.lastOutput = '';
  state.term.reset();
  renderToolbar();
  wsSend({ type: kind, exerciseId: state.current.id, code: state.editor.getValue() });
  if (kind === 'run') state.term.focus();
}

function stopJob() {
  wsSend({ type: 'kill' });
}

// ---------------------------------------------------------------------------
// progress and top bar
// ---------------------------------------------------------------------------

function allExercises() {
  return state.tracks.flatMap((t) => t.exercises.map((e) => ({ ...e, trackTitle: t.title })));
}

function updateProgress(id, view) {
  for (const t of state.tracks) {
    for (const e of t.exercises) {
      if (e.id === id) e.progress = view;
    }
  }
  if (state.current && state.current.id === id) state.current.progress = view;
  renderPath();
  renderTopbar();
  renderHints();
  renderToolbar();
}

function renderTopbar() {
  const all = allExercises();
  const solved = all.filter((e) => ['solved', 'review-due'].includes(e.progress.status)).length;
  const due = all.filter((e) => e.progress.status === 'review-due').length;
  const chip = $('#chip-progress');
  chip.textContent = `${solved}/${all.length} solved${due ? ` · ${due} due` : ''}`;
  chip.className = `chip ${due ? 'warn' : solved ? 'ok' : ''}`;
  const badge = $('#due-badge');
  badge.textContent = String(due);
  badge.classList.toggle('hidden', !due);

  const crumb = $('#crumb');
  crumb.textContent = '';
  if (state.current) {
    const meta = all.find((e) => e.id === state.current.id);
    crumb.append(meta ? `${meta.trackTitle} / ` : '', h('b', { text: state.current.title }));
  }
}

function renderPath() {
  const root = $('#tab-path');
  root.textContent = '';
  for (const t of state.tracks) {
    const solved = t.exercises.filter((e) => ['solved', 'review-due'].includes(e.progress.status)).length;
    root.append(
      h(
        'div',
        { class: 'track' },
        h('h2', { text: `${t.title}  (${solved}/${t.exercises.length})` }),
        h('div', { class: 'blurb', text: t.blurb }),
        t.exercises.map((e) =>
          h(
            'button',
            {
              class: `ex-row${state.current && state.current.id === e.id ? ' current' : ''}`,
              'data-id': e.id,
              onclick: () => {
                openExercise(e.id);
                showTab('exercise');
              },
            },
            h('span', { class: `dot dot-${e.progress.status}`, title: e.progress.status }),
            h('span', { class: 't', text: e.title }),
            e.progress.status === 'review-due' ? h('span', { class: 'due', text: 'review due' }) : null,
          ),
        ),
      ),
    );
  }
}

function showTab(name) {
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  $('#tab-exercise').classList.toggle('hidden', name !== 'exercise');
  $('#tab-path').classList.toggle('hidden', name !== 'path');
}

// ---------------------------------------------------------------------------
// exercise pane
// ---------------------------------------------------------------------------

async function colorize(root) {
  if (!state.monaco) return;
  for (const code of $$('pre code[data-lang]', root)) {
    const lang = code.dataset.lang.toLowerCase();
    if (!['cpp', 'c++', 'c', 'h', 'hpp', 'cc'].includes(lang)) continue;
    try {
      code.innerHTML = await state.monaco.editor.colorize(code.textContent, 'cpp', { tabSize: 4 });
    } catch {
      /* leave plain */
    }
  }
}

function renderExercise() {
  const ex = state.current;
  const head = $('#ex-head');
  head.textContent = '';
  head.append(
    h('h1', { text: ex.title }),
    h(
      'div',
      { class: 'meta' },
      ex.minutes ? h('span', { class: 'tag', text: `~${ex.minutes} min` }) : null,
      ex.concepts.map((c) => h('span', { class: 'tag', text: c })),
    ),
  );
  const prompt = $('#ex-prompt');
  // The prompt starts with its own "# Title" line; the header above already shows it.
  prompt.innerHTML = md(ex.prompt.replace(/^#\s+.*\n+/, ''));
  colorize(prompt);
  $('#tab-exercise').scrollTop = 0;
  renderResults();
  renderHints();
  renderToolbar();
  renderTopbar();
  renderPath();
}

function relativeDue(iso) {
  if (!iso) return '';
  const days = Math.round((Date.parse(iso) - Date.now()) / 86400000);
  if (days <= 0) return 'later today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function nextExerciseAfter(id) {
  const all = allExercises();
  const i = all.findIndex((e) => e.id === id);
  const after = all.slice(i + 1).concat(all.slice(0, i));
  return after.find((e) => ['new', 'started', 'reviewing'].includes(e.progress.status)) || null;
}

function renderResults() {
  const box = $('#ex-results');
  box.textContent = '';
  const msg = state.current && state.lastResults.get(state.current.id);
  if (!msg) return;
  const s = msg.summary;
  const r = s.results;
  let cls = 'fail';
  let title;
  if (!s.compiled) title = 'Did not compile. The compiler messages are in the terminal.';
  else if (s.timedOut) title = 'Timed out. Check for an infinite loop.';
  else if (!r) title = `The tests stopped early (${s.signal ? `crashed: ${s.signal}` : `exit code ${s.exitCode}`}). The terminal shows where.`;
  else if (s.passedAll) {
    cls = 'pass';
    title = `All ${r.total} tests pass.`;
  } else title = `${r.passed} of ${r.total} tests passing.`;

  const list = r ? h('ul', {}, r.tests.map((t) => h('li', {}, h('span', { class: t.ok ? 'pass-mark' : 'fail-mark', text: t.ok ? '✓' : '✗' }), t.name.replace(/_/g, ' ')))) : null;
  const next = s.passedAll ? nextExerciseAfter(state.current.id) : null;
  box.append(
    h(
      'div',
      { class: `results ${cls}` },
      h('div', { class: 'head', text: title }),
      list,
      s.passedAll
        ? h('div', { class: 'note', text: `Solved${msg.progress.revealed ? ' with the reference solution' : ''}. A review is scheduled ${relativeDue(msg.progress.dueAt)}: you will re-solve it from a blank file.` })
        : null,
      next ? h('div', { class: 'next' }, h('button', { class: 'btn primary', onclick: () => openExercise(next.id), text: `Next: ${next.title} →` })) : null,
    ),
  );
}

function renderHints() {
  const root = $('#ex-hints');
  root.textContent = '';
  const ex = state.current;
  if (!ex) return;
  const p = ex.progress;
  const shown = ex.hints || [];
  const left = ex.hintCount - p.hintsUsed;
  const unlocked = p.attempts >= 1 && left === 0;

  root.append(h('div', { class: 'hints' }, h('h2', { text: 'Hints' })));
  const wrap = root.firstChild;
  shown.forEach((text, i) => {
    const body = h('div', { class: 'prose' });
    body.innerHTML = md(text);
    wrap.append(h('div', { class: 'hint' }, h('div', { class: 'label', text: `Hint ${i + 1} of ${ex.hintCount}` }), body));
  });
  wrap.append(
    h(
      'div',
      { class: 'actions' },
      h('button', { class: 'btn', disabled: left === 0, onclick: revealHint, text: left > 0 ? `Show hint (${left} left)` : 'No more hints' }),
      h('button', { class: 'btn', disabled: !unlocked, onclick: revealReference, text: 'Reference solution' }),
    ),
    h('div', {
      class: 'reveal-note',
      text: unlocked
        ? 'Looking at it schedules a quick review for tomorrow.'
        : 'The reference solution unlocks after you have run the tests once and used every hint.',
    }),
  );
}

async function revealHint() {
  try {
    const r = await api('POST', `/api/exercise/${state.current.id}/hint`);
    state.current.hints.push(r.hint);
    updateProgress(state.current.id, r.progress);
  } catch (e) {
    alert(e.message);
  }
}

function showDialog(title, markdown) {
  $('#dlg-title').textContent = title;
  const body = $('#dlg-body');
  body.innerHTML = md(markdown);
  colorize(body);
  $('#dlg').showModal();
}

async function revealReference() {
  if (!confirm('Show the reference solution?\n\nIt is worth trying one more time first. If you look, the exercise will be scheduled for a quick review tomorrow.')) return;
  try {
    const r = await api('POST', `/api/exercise/${state.current.id}/reveal`, { confirm: true });
    updateProgress(state.current.id, r.progress);
    showDialog('Reference solution', `\`\`\`cpp\n${r.code}\n\`\`\`\n\nRead it, close it, then write it again from memory in your own file.`);
  } catch (e) {
    alert(e.message);
  }
}

function renderToolbar() {
  const busy = Boolean(state.running);
  const p = state.current && state.current.progress;
  $('#btn-test').disabled = busy || !state.current;
  $('#btn-run').disabled = busy || !state.current;
  $('#btn-stop').classList.toggle('hidden', !busy);
  $('#btn-reset').disabled = busy || !state.current;
  const review = $('#btn-review');
  const canReview = p && (p.status === 'solved' || p.status === 'review-due');
  review.classList.toggle('hidden', !canReview);
  review.textContent = p && p.status === 'review-due' ? 'Review (due)' : 'Practise again';
  review.disabled = busy;
}

async function resetExercise() {
  if (!confirm('Replace your code with the starter file?\n\nYour current code is archived in work/<exercise>/history/.')) return;
  try {
    const r = await api('POST', `/api/exercise/${state.current.id}/reset`);
    state.models.get(state.current.id).setValue(r.code);
    setSaveState('Saved');
  } catch (e) {
    alert(e.message);
  }
}

async function startReview() {
  if (!confirm('Start this exercise again from a blank file?\n\nYour current solution is archived in work/<exercise>/history/. Try to solve it without looking at it.')) return;
  try {
    const r = await api('POST', `/api/exercise/${state.current.id}/review`);
    state.models.get(state.current.id).setValue(r.code);
    state.current.hints = [];
    state.lastResults.delete(state.current.id);
    updateProgress(state.current.id, r.progress);
    renderResults();
    setSaveState('Saved');
  } catch (e) {
    alert(e.message);
  }
}

async function openExercise(id) {
  await flushSave();
  let ex;
  try {
    ex = await api('GET', `/api/exercise/${id}`);
  } catch (e) {
    alert(e.message);
    return;
  }
  state.current = ex;
  store.set('dojo.last', id);
  let model = state.models.get(id);
  if (!model) {
    model = state.monaco.editor.createModel(ex.code, 'cpp');
    model.onDidChangeContent(() => onEdit(id));
    state.models.set(id, model);
  }
  state.editor.setModel(model);
  setSaveState('');
  renderExercise();
  renderChat();
  state.editor.focus();
}

// ---------------------------------------------------------------------------
// tutor chat
// ---------------------------------------------------------------------------

const QUICK = [
  "I'm stuck. Where should I start?",
  'Explain the compiler error',
  'Is my approach reasonable?',
  'Which C++ concept am I missing?',
];

function chatMessages(id) {
  if (!state.chat.byExercise[id]) state.chat.byExercise[id] = store.get(`dojo.chat.${id}`, []);
  return state.chat.byExercise[id];
}

function persistChat(id) {
  store.set(`dojo.chat.${id}`, chatMessages(id).filter((m) => m.role !== 'error').slice(-30));
}

function bubble(msg, streaming = false) {
  if (msg.role === 'user') return h('div', { class: 'msg user', text: msg.content });
  if (msg.role === 'error') return h('div', { class: 'msg error', text: msg.content });
  const body = h('div', { class: `prose${streaming ? ' typing' : ''}` });
  body.innerHTML = md(msg.content);
  return h('div', { class: 'msg assistant' }, body);
}

function renderChat() {
  const log = $('#chat-log');
  log.textContent = '';
  const msgs = state.current ? chatMessages(state.current.id) : [];
  if (!msgs.length) {
    log.append(
      h('div', {
        class: 'empty',
        text: 'Ask about this exercise, a compiler error, or any C++ concept. In Socratic mode the tutor asks questions and nudges you rather than handing over the answer.',
      }),
    );
  }
  for (const m of msgs) log.append(bubble(m));
  colorize(log);
  log.scrollTop = log.scrollHeight;
}

function setChatBusy(busy) {
  state.chat.busy = busy;
  $('#btn-send').classList.toggle('hidden', busy);
  $('#btn-chat-stop').classList.toggle('hidden', !busy);
}

function chatNote(html) {
  const note = $('#chat-note');
  note.classList.toggle('hidden', !html);
  note.innerHTML = html || '';
}

async function sendChat(text) {
  text = text.trim();
  if (!text || state.chat.busy || !state.current) return;
  if (!state.chat.model) {
    chatNote('No model selected. Start Ollama (<code>ollama serve</code>), pull a model (<code>ollama pull llama3.2</code>) and reload this page.');
    return;
  }
  const id = state.current.id;
  const msgs = chatMessages(id);
  const reply = { role: 'assistant', content: '' };
  msgs.push({ role: 'user', content: text }, reply);
  $('#chat-input').value = '';
  renderChat();

  const share = $('#opt-context').checked;
  const body = {
    exerciseId: id,
    model: state.chat.model,
    mode: state.chat.mode,
    messages: msgs.filter((m) => m !== reply && m.role !== 'error').map(({ role, content }) => ({ role, content })),
    code: share ? state.models.get(id).getValue() : undefined,
    output: share ? state.lastOutput : undefined,
  };

  const controller = new AbortController();
  state.chat.controller = controller;
  setChatBusy(true);

  let el = null;
  const paint = () => {
    if (!state.current || state.current.id !== id) return;
    const log = $('#chat-log');
    if (!el || !el.isConnected) {
      el = bubble(reply, true);
      log.append(el);
    } else {
      $('.prose', el).innerHTML = md(reply.content);
      $('.prose', el).classList.add('typing');
    }
    log.scrollTop = log.scrollHeight;
  };
  let raf = 0;
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); });
  };

  const fail = (message) => {
    msgs.push({ role: 'error', content: message });
  };

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try { message = (await res.json()).error || message; } catch { /* keep default */ }
      throw new Error(message);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let obj;
        try { obj = JSON.parse(line); } catch { continue; }
        if (obj.delta) { reply.content += obj.delta; schedule(); }
        if (obj.error) fail(obj.error);
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') fail(e.message);
  } finally {
    if (raf) cancelAnimationFrame(raf);
    if (!reply.content) msgs.splice(msgs.indexOf(reply), 1);
    setChatBusy(false);
    state.chat.controller = null;
    persistChat(id);
    if (state.current && state.current.id === id) renderChat();
  }
}

function setupChat(settings) {
  const mode = ['socratic', 'explain', 'code'].includes(settings.mode) ? settings.mode : 'socratic';
  state.chat.mode = mode;
  $$('#mode-seg button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  $('#mode-seg').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    state.chat.mode = b.dataset.mode;
    $$('#mode-seg button').forEach((x) => x.classList.toggle('active', x === b));
    api('PUT', '/api/settings', { mode: b.dataset.mode }).catch(() => {});
  });

  $('#quick').append(...QUICK.map((q) => h('button', { onclick: () => sendChat(q), text: q })));
  $('#btn-send').addEventListener('click', () => sendChat($('#chat-input').value));
  $('#btn-chat-stop').addEventListener('click', () => state.chat.controller && state.chat.controller.abort());
  $('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendChat($('#chat-input').value);
    }
  });
  $('#btn-chat-clear').addEventListener('click', () => {
    if (!state.current) return;
    state.chat.byExercise[state.current.id] = [];
    persistChat(state.current.id);
    renderChat();
  });
}

async function loadModels() {
  const select = $('#model-select');
  const chip = $('#chip-tutor');
  let info;
  try {
    info = await api('GET', '/api/models');
  } catch (e) {
    info = { ok: false, models: [], error: e.message, settings: {} };
  }
  setupChat(info.settings || {});
  state.chat.models = info.models;
  select.textContent = '';
  if (!info.ok || !info.models.length) {
    chip.textContent = 'tutor offline';
    chip.className = 'chip bad';
    select.classList.add('hidden');
    chatNote(
      info.ok
        ? 'Ollama is running but has no models. Run <code>ollama pull llama3.2</code> and reload.'
        : 'The tutor needs Ollama. Start it with <code>ollama serve</code>, make sure you have a model (<code>ollama pull llama3.2</code>), then reload this page. Hints and the exercises work without it.',
    );
    return;
  }
  const saved = info.settings && info.settings.model;
  state.chat.model = info.models.includes(saved) ? saved : info.models[0];
  select.append(...info.models.map((m) => h('option', { value: m, text: m, selected: m === state.chat.model })));
  select.addEventListener('change', () => {
    state.chat.model = select.value;
    chip.textContent = `tutor: ${select.value}`;
    api('PUT', '/api/settings', { model: select.value }).catch(() => {});
  });
  chip.textContent = `tutor: ${state.chat.model}`;
  chip.className = 'chip ok';
}

// ---------------------------------------------------------------------------
// start-up
// ---------------------------------------------------------------------------

function showFatal(message) {
  document.body.textContent = '';
  document.body.append(h('pre', { style: 'padding:24px;color:#f7768e;white-space:pre-wrap;font:14px monospace', text: message }));
}

async function init() {
  setupLayout();
  $$('.tab').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
  $('#btn-test').addEventListener('click', () => startJob('test'));
  $('#btn-run').addEventListener('click', () => startJob('run'));
  $('#btn-stop').addEventListener('click', stopJob);
  $('#btn-reset').addEventListener('click', resetExercise);
  $('#btn-review').addEventListener('click', startReview);
  $('#btn-clear').addEventListener('click', () => state.term.reset());
  $('#dlg-close').addEventListener('click', () => $('#dlg').close());
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      startJob(e.shiftKey ? 'run' : 'test');
    }
  });

  try {
    state.monaco = await loadMonaco();
  } catch (e) {
    return showFatal(`${e.message}\n\nRun "npm install" in the project folder, then restart the server.`);
  }
  setupEditor(state.monaco);
  setupTerminal();

  const [status, curriculum] = await Promise.all([api('GET', '/api/status'), api('GET', '/api/curriculum')]);
  state.tracks = curriculum.tracks;
  const cc = $('#chip-compiler');
  if (status.compiler) {
    cc.textContent = `${status.compiler.name} · ${status.compiler.std}${status.compiler.sanitizers ? ' · sanitizers' : ''}`;
    cc.className = `chip ${status.compiler.sanitizers ? 'ok' : 'warn'}`;
    cc.title = status.compiler.version + (status.compiler.sanitizers ? '' : ' (sanitizers unavailable: memory and undefined-behaviour errors will not be caught)');
  } else {
    cc.textContent = 'no compiler found';
    cc.className = 'chip bad';
    state.term.writeln('\x1b[31mNo C++ compiler found. On macOS run: xcode-select --install\x1b[0m');
  }

  renderTopbar();
  renderPath();
  loadModels();

  const all = allExercises();
  if (!all.length) return showFatal('No exercises found in the exercises/ folder.');
  const last = store.get('dojo.last', null);
  const start = all.find((e) => e.id === last) || all.find((e) => e.progress.status !== 'solved') || all[0];
  await openExercise(start.id);
}

init().catch((e) => showFatal(`Something went wrong while starting:\n${e.stack || e.message}`));
