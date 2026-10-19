/* Exercise page. Receives {type:'state', state} from the extension and posts user actions back. */
(function () {
  const vscode = acquireVsCodeApi();
  const { md, highlightAll } = window.DojoRender;
  const root = document.getElementById('root');

  function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'text') el.textContent = v;
      else if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  const send = (type, extra) => vscode.postMessage(Object.assign({ type }, extra));

  function relativeDue(days) {
    if (days == null) return '';
    if (days <= 0) return 'later today';
    if (days === 1) return 'tomorrow';
    return 'in ' + days + ' days';
  }

  function resultsBox(s) {
    const last = s.last;
    if (!last) return null;
    const r = last.results;
    let cls = 'fail';
    let title;
    if (last.cancelled) return null;
    if (!last.compiled) title = 'Did not compile. The errors are underlined in your file and listed in the Problems panel.';
    else if (last.timedOut) title = 'Timed out. Check for an infinite loop.';
    else if (!r) title = 'The tests stopped early (' + (last.signal ? 'crashed: ' + last.signal : 'exit code ' + last.exitCode) + '). Open the "Learning Dojo" output for details.';
    else if (last.passedAll) {
      cls = 'pass';
      title = 'All ' + r.total + ' tests pass.';
    } else title = r.passed + ' of ' + r.total + ' tests passing.';

    const list = r
      ? h('ul', null, r.tests.map((t) =>
          h('li', null,
            h('span', { class: t.ok ? 'pass-mark' : 'fail-mark', text: t.ok ? '✓' : '✗' }),
            t.name.replace(/_/g, ' '),
            !t.ok && t.message ? h('span', { class: 'msg', text: t.message }) : null)))
      : null;

    return h('div', { class: 'results ' + cls },
      h('div', { class: 'head', text: title }),
      list,
      last.passedAll
        ? h('div', { class: 'note', text: 'Solved' + (s.progress.revealed ? ' with the reference solution' : '') + '. A review is scheduled ' + relativeDue(s.dueDays) + ': you will re-solve it from a blank file.' })
        : null,
      last.passedAll && s.next
        ? h('div', { class: 'next' }, h('button', { class: 'btn primary', text: 'Next: ' + s.next.title + ' →', onclick: () => send('openNext', { id: s.next.id }) }))
        : null);
  }

  function hintsBox(s) {
    const ex = s.exercise;
    const left = ex.hintCount - s.progress.hintsUsed;
    const wrap = h('section', { class: 'hints' }, h('h2', { text: 'Hints' }));
    ex.hints.forEach((text, i) => {
      const body = h('div', { class: 'prose' });
      body.innerHTML = md(text);
      wrap.append(h('div', { class: 'hint' }, h('div', { class: 'label', text: 'Hint ' + (i + 1) + ' of ' + ex.hintCount }), body));
    });
    wrap.append(
      h('div', { class: 'actions' },
        h('button', { class: 'btn', disabled: left === 0 || s.running, onclick: () => send('hint'), text: left > 0 ? 'Show hint (' + left + ' left)' : 'No more hints' }),
        h('button', { class: 'btn', disabled: !s.canReveal, onclick: () => send('reveal'), text: 'Reference solution' })),
      h('div', { class: 'reveal-note', text: s.canReveal ? 'Looking at it schedules a quick review for tomorrow.' : 'The reference solution unlocks after you have run the tests once and used every hint.' }));
    return wrap;
  }

  function render(s) {
    const scroll = window.scrollY;
    const sameExercise = root.dataset.id === (s && s.exercise.id);
    root.textContent = '';
    if (!s) {
      delete root.dataset.id;
      root.append(h('p', { class: 'muted', text: 'Pick an exercise from the Dojo view to begin.' }));
      return;
    }
    root.dataset.id = s.exercise.id;
    const ex = s.exercise;
    const p = s.progress;
    const canReview = p.status === 'solved' || p.status === 'review-due';

    const prompt = h('div', { class: 'prose' });
    // The prompt starts with its own "# Title" line; the header already shows it.
    prompt.innerHTML = md(ex.prompt.replace(/^#\s+.*\n+/, ''));
    highlightAll(prompt);

    root.append(
      h('header', null,
        h('div', { class: 'track', text: ex.language + ' · ' + ex.track }),
        h('h1', { text: ex.title }),
        h('div', { class: 'meta' },
          ex.minutes ? h('span', { class: 'tag', text: '~' + ex.minutes + ' min' }) : null,
          ex.concepts.map((c) => h('span', { class: 'tag', text: c })))),
      h('div', { class: 'toolbar' },
        h('button', { class: 'btn primary', disabled: s.running, onclick: () => send('runTests'), text: s.running ? 'Running…' : 'Run Tests' }),
        h('button', { class: 'btn', disabled: s.running, onclick: () => send('run'), text: 'Run' }),
        h('button', { class: 'btn', disabled: s.running, onclick: () => send('reset'), text: 'Reset' }),
        canReview ? h('button', { class: 'btn', disabled: s.running, onclick: () => send('practiceAgain'), text: p.status === 'review-due' ? 'Review (due)' : 'Practise again' }) : null,
        h('span', { class: 'spacer' }),
        h('span', { class: 'compiler', text: s.compiler })),
      resultsBox(s),
      prompt,
      hintsBox(s));
    if (sameExercise) window.scrollTo(0, scroll);
  }

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'state') render(e.data.state);
  });
  send('ready');
})();
