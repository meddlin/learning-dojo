/* Tutor chat page. */
(function () {
  const vscode = acquireVsCodeApi();
  const { md, highlightAll } = window.DojoRender;
  const $ = (s) => document.querySelector(s);
  const quick = () => ["I'm stuck. Where should I start?", 'Explain the compiler error', 'Is my approach reasonable?', 'Which ' + st.language + ' concept am I missing?'];

  const st = { language: 'C++', exercise: null, history: [], busy: false, enabled: true, hasModel: false, reply: null, replyEl: null };
  const post = (type, extra) => vscode.postMessage(Object.assign({ type }, extra));

  function persistedShare() {
    const s = vscode.getState();
    return s && typeof s.share === 'boolean' ? s.share : true;
  }
  $('#share').checked = persistedShare();
  $('#share').addEventListener('change', () => vscode.setState({ share: $('#share').checked }));

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function bubble(m, streaming) {
    if (m.role === 'user') return el('div', 'msg user', m.content);
    if (m.role === 'error') return el('div', 'msg error', m.content);
    const wrap = el('div', 'msg assistant');
    const body = el('div', 'prose' + (streaming ? ' typing' : ''));
    body.innerHTML = md(m.content);
    highlightAll(body);
    wrap.append(body);
    return wrap;
  }

  function renderLog() {
    const log = $('#log');
    log.textContent = '';
    if (!st.exercise) {
      log.append(el('div', 'empty', 'Open an exercise from the Dojo view, then ask about it here.'));
      return;
    }
    if (!st.history.length) {
      log.append(el('div', 'empty', 'Ask about this exercise, a compiler error, or any ' + st.language + ' concept. In "Guide me" mode the tutor asks questions and nudges you rather than handing over the answer.'));
    }
    for (const m of st.history) log.append(bubble(m));
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(busy) {
    st.busy = busy;
    $('#stop').classList.toggle('hidden', !busy);
    $('#sendbtn').classList.toggle('hidden', busy);
    $('#sendbtn').disabled = false;
    refreshControls();
  }

  function refreshControls() {
    const can = st.enabled && st.exercise && !st.busy;
    document.querySelectorAll('#quick button').forEach((b) => (b.disabled = !can));
    $('#input').disabled = !st.enabled;
  }

  function status(html) {
    const s = $('#status');
    s.classList.toggle('hidden', !html);
    s.innerHTML = html || '';
  }

  function setMode(mode) {
    document.querySelectorAll('.modes button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  }

  $('.modes').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    setMode(b.dataset.mode);
    post('setMode', { mode: b.dataset.mode });
  });
  $('#model').addEventListener('change', () => post('setModel', { model: $('#model').value }));

  // Rebuilt when the language changes, because one of the prompts names it.
  function renderQuick() {
    $('#quick').textContent = '';
    $('#quick').append(
      ...quick().map((q) => {
        const b = el('button', '', q);
        b.type = 'button';
        b.addEventListener('click', () => submit(q));
        return b;
      }),
    );
  }
  renderQuick();

  function submit(text) {
    text = String(text || '').trim();
    if (!text || st.busy || !st.exercise || !st.enabled) return;
    st.history.push({ role: 'user', content: text });
    st.reply = { role: 'assistant', content: '' };
    st.replyEl = null;
    $('#input').value = '';
    renderLog();
    setBusy(true);
    post('send', { text, share: $('#share').checked });
  }

  $('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    submit($('#input').value);
  });
  $('#input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      submit($('#input').value);
    }
  });
  $('#stop').addEventListener('click', () => post('stop'));
  $('#clear').addEventListener('click', () => {
    if (st.exercise) post('clear');
  });

  let raf = 0;
  function paintReply() {
    raf = 0;
    if (!st.reply) return;
    const log = $('#log');
    if (!st.replyEl || !st.replyEl.isConnected) {
      st.replyEl = bubble(st.reply, true);
      log.append(st.replyEl);
    } else {
      const body = st.replyEl.querySelector('.prose');
      body.innerHTML = md(st.reply.content);
      body.classList.add('typing');
    }
    log.scrollTop = log.scrollHeight;
  }

  function init(m) {
    st.enabled = m.enabled;
    if (m.language && m.language !== st.language) {
      st.language = m.language;
      renderQuick();
    }
    st.exercise = m.exercise;
    if (!st.busy) st.history = m.history || [];
    st.reply = st.busy ? st.reply : null;
    setMode(m.mode);
    const sel = $('#model');
    sel.textContent = '';
    const models = m.models.length ? m.models : m.model ? [m.model] : [];
    for (const name of models) {
      const o = el('option', '', name);
      o.value = name;
      sel.append(o);
    }
    if (m.model) sel.value = m.model;
    sel.disabled = !models.length;
    st.hasModel = Boolean(m.model);
    if (!m.enabled) status('The tutor is turned off. Enable <code>dojo.tutor.enabled</code> in Settings.');
    else if (m.error) status(m.error.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
    else if (!m.models.length) status('Ollama is running but has no models. Try <code>ollama pull qwen2.5-coder:7b</code>.');
    else status('');
    renderLog();
    refreshControls();
  }

  window.addEventListener('message', (e) => {
    const m = e.data || {};
    switch (m.type) {
      case 'init':
        init(m);
        break;
      case 'history':
        st.history = m.history || [];
        renderLog();
        break;
      case 'started':
        break;
      case 'delta':
        if (st.reply) {
          st.reply.content += m.text;
          if (!raf) raf = requestAnimationFrame(paintReply);
        }
        break;
      case 'done':
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (st.reply && st.reply.content.trim()) st.history.push(st.reply);
        if (m.error) st.history.push({ role: 'error', content: m.error });
        st.reply = null;
        st.replyEl = null;
        setBusy(false);
        renderLog();
        break;
      case 'error':
        st.history.push({ role: 'error', content: m.message });
        st.reply = null;
        st.replyEl = null;
        setBusy(false);
        renderLog();
        break;
    }
  });
  post('ready');
})();
