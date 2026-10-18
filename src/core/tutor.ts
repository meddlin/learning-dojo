// The tutor: builds a teaching-oriented system prompt and streams answers from
// a local Ollama server. No VS Code imports, so it can be tested directly.

import type { LanguagePack } from './languages';

export type TutorMode = 'socratic' | 'explain' | 'code';
export const MODES: TutorMode[] = ['socratic', 'explain', 'code'];

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ollamaBase(configured = '', env: NodeJS.ProcessEnv = process.env): string {
  const pick = configured.trim() || (env.OLLAMA_URL ?? '').trim();
  if (pick) return pick.replace(/\/+$/, '');
  const host = (env.OLLAMA_HOST ?? '').trim();
  if (host) {
    const withProto = /^https?:\/\//.test(host) ? host : `http://${host}`;
    return withProto.replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:11434';
}

const MODE_RULES: Record<TutorMode, string[]> = {
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
    '- {{connect}}',
    '- Do NOT write the solution to the current exercise. Explain the ideas, then invite them to try.',
  ],
  code: [
    'You are in SHOW-CODE mode. The learner has asked to see code.',
    '- You may show a working approach, but keep it as small as possible and explain each important line.',
    '- After showing code, ask them to close the explanation and retype the solution from memory, then change one thing (a different input, a different edge case) to check they understand it.',
  ],
};

export function clip(text: unknown, max: number): string {
  const s = String(text ?? '');
  return s.length > max ? `${s.slice(0, max)}\n... (truncated)` : s;
}

export interface PromptInput {
  /** The language of the current exercise. */
  language: LanguagePack;
  title: string;
  prompt: string;
  mode: TutorMode;
  code?: string;
  output?: string;
}

export function systemPrompt(input: PromptInput): string {
  const { language } = input;
  const rules = (MODE_RULES[input.mode] ?? MODE_RULES.socratic).map((r) => r.replace('{{connect}}', language.tutor.connect));
  const parts = [
    `You are the tutor inside "Learning Dojo", ${language.tutor.course}.`,
    `The learner is ${language.tutor.learner}. They want to be able to write these programs themselves, so teaching beats telling.`,
    `Be concise: short paragraphs, plain language, no filler. Use fenced code blocks for code. ${language.tutor.style}`,
    '',
    ...rules,
    '',
    `Current exercise: ${input.title}`,
    'Exercise statement:',
    clip(input.prompt, 6000),
  ];
  if (input.code) parts.push('', "The learner's current code:", `\`\`\`${language.fenceTag}`, clip(input.code, 8000), '```');
  if (input.output) parts.push('', 'The most recent compiler or test output:', '```', clip(input.output, 3000), '```');
  return parts.join('\n');
}

export function buildMessages(history: ChatMessage[], prompt: PromptInput): Array<{ role: string; content: string }> {
  const cleaned = history
    .slice(-12)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: clip(m.content, 4000) }));
  return [{ role: 'system', content: systemPrompt(prompt) }, ...cleaned];
}

export interface ModelList {
  ok: boolean;
  models: string[];
  error?: string;
}

export async function listModels(base: string, timeoutMs = 2500): Promise<ModelList> {
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(timeoutMs) });
    if (!r.ok) return { ok: false, models: [], error: `Ollama answered with HTTP ${r.status}` };
    const data = (await r.json()) as { models?: Array<{ name?: string }> };
    return { ok: true, models: (data.models ?? []).map((m) => m.name).filter((n): n is string => Boolean(n)) };
  } catch {
    return { ok: false, models: [], error: `Could not reach Ollama at ${base}. Start it with "ollama serve" and pull a model.` };
  }
}

export interface StreamOptions {
  base: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
}

/** Streams a reply, calling onDelta for each piece. Resolves with an error message, or undefined on success. */
export async function streamChat(opts: StreamOptions): Promise<string | undefined> {
  try {
    const r = await fetch(`${opts.base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: opts.model, messages: opts.messages, stream: true, options: { temperature: 0.4, num_ctx: 8192 } }),
      signal: opts.signal,
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      let detail = text;
      try {
        detail = (JSON.parse(text) as { error?: string }).error || text;
      } catch {
        /* keep the raw text */
      }
      return `Ollama error (${r.status}): ${detail || 'no details'}`;
    }
    if (!r.body) return 'Ollama sent an empty response.';
    const reader = r.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    let error: string | undefined;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        let obj: { error?: string; message?: { content?: string } };
        try {
          obj = JSON.parse(line);
        } catch {
          continue;
        }
        if (obj.error) error = String(obj.error);
        const delta = obj.message?.content;
        if (delta) opts.onDelta(delta);
      }
    }
    return error;
  } catch (e) {
    if ((e as Error).name === 'AbortError') return undefined;
    return `Could not reach Ollama at ${opts.base}: ${(e as Error).message}`;
  }
}
