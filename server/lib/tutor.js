'use strict';
// The tutor chat: builds a teaching-oriented system prompt and streams answers
// from a local Ollama server.

function ollamaBase() {
  if (process.env.OLLAMA_URL) return process.env.OLLAMA_URL.replace(/\/+$/, '');
  const host = process.env.OLLAMA_HOST;
  if (host) {
    const withProto = /^https?:\/\//.test(host) ? host : `http://${host}`;
    return withProto.replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:11434';
}

const MODE_RULES = {
  socratic: [
    'You are in SOCRATIC mode. The learner wants to work the solution out themselves.',
    '- Start by working out where they are stuck. If it is unclear, ask what they have tried and what they expected to happen.',
    '- Give at most one small nudge at a time: a question, a pointer to the relevant concept, or what a compiler message means.',
    '- Do NOT write the solution or any code that solves the exercise. A one-line syntax example on an unrelated toy case is fine.',
    '- If they paste an error, explain what it means in plain language and where to look, but let them make the fix.',
  ],
  explain: [
    'You are in EXPLAIN mode. The learner wants to understand a concept properly.',
    '- Explain clearly and concretely, with small examples on toy problems that are different from the exercise itself.',
    '- Connect ideas to what they already know from other C-style languages, and call out where C and C++ differ (memory, undefined behaviour, value semantics).',
    '- Do NOT write the solution to the current exercise. Explain the ideas, then invite them to try.',
  ],
  code: [
    'You are in SHOW-CODE mode. The learner has asked to see code.',
    '- You may show a working approach, but keep it as small as possible and explain each important line.',
    '- After showing code, ask them to close the explanation and retype the solution from memory, then change one thing (a different input, a different edge case) to check they understand it.',
  ],
};

function clip(text, max) {
  const s = String(text || '');
  return s.length > max ? `${s.slice(0, max)}\n... (truncated)` : s;
}

function systemPrompt({ exercise, prompt, mode, code, output }) {
  const rules = MODE_RULES[mode] || MODE_RULES.socratic;
  const parts = [
    'You are the tutor inside "C++ Dojo", a local learning environment for C and C++, data structures and algorithms (graph traversal, then matrix transforms).',
    'The learner is an experienced programmer who knows C-style syntax but has never written substantial C or C++. They want to be able to write these programs themselves, so teaching beats telling.',
    'Be concise: short paragraphs, plain language, no filler. Use fenced code blocks for code. Mention undefined behaviour, ownership and lifetimes when they matter.',
    '',
    ...rules,
    '',
    `Current exercise: ${exercise.title}`,
    'Exercise statement:',
    clip(prompt, 6000),
  ];
  if (code) parts.push('', "The learner's current code:", '```cpp', clip(code, 8000), '```');
  if (output) parts.push('', 'The most recent terminal output (compiler or test run):', '```', clip(output, 3000), '```');
  return parts.join('\n');
}

function buildMessages(body, exercise, prompt) {
  const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const cleaned = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: clip(m.content, 4000) }));
  return [
    {
      role: 'system',
      content: systemPrompt({
        exercise,
        prompt,
        mode: body.mode,
        code: typeof body.code === 'string' ? body.code : '',
        output: typeof body.output === 'string' ? body.output : '',
      }),
    },
    ...cleaned,
  ];
}

async function listModels() {
  try {
    const r = await fetch(`${ollamaBase()}/api/tags`, { signal: AbortSignal.timeout(2500) });
    if (!r.ok) return { ok: false, error: `Ollama answered with HTTP ${r.status}`, models: [] };
    const data = await r.json();
    const models = (data.models || []).map((m) => m.name).filter(Boolean);
    return { ok: true, models };
  } catch {
    return {
      ok: false,
      error: `Could not reach Ollama at ${ollamaBase()}. Start it with "ollama serve" and pull a model.`,
      models: [],
    };
  }
}

// Streams NDJSON lines of {delta} / {error} / {done} to the HTTP response.
async function streamChat({ model, messages }, res) {
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  const send = (obj) => {
    if (!res.writableEnded) res.write(`${JSON.stringify(obj)}\n`);
  };

  try {
    const r = await fetch(`${ollamaBase()}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        options: { temperature: 0.4, num_ctx: 8192 },
      }),
      signal: controller.signal,
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      let detail = text;
      try {
        detail = JSON.parse(text).error || text;
      } catch {
        /* keep raw text */
      }
      send({ error: `Ollama error (${r.status}): ${detail || 'no details'}` });
      return res.end();
    }
    const decoder = new TextDecoder();
    let buf = '';
    for await (const chunk of r.body) {
      buf += decoder.decode(chunk, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let obj;
        try {
          obj = JSON.parse(line);
        } catch {
          continue;
        }
        if (obj.error) send({ error: String(obj.error) });
        const delta = obj.message && obj.message.content;
        if (delta) send({ delta });
        if (obj.done) send({ done: true });
      }
    }
    res.end();
  } catch (e) {
    if (e.name !== 'AbortError') {
      send({ error: `Could not reach Ollama at ${ollamaBase()}: ${e.message}` });
    }
    if (!res.writableEnded) res.end();
  }
}

module.exports = { listModels, streamChat, buildMessages, ollamaBase };
