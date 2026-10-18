import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import type { LanguageId, ProgressView } from './types';

const DAY = 24 * 60 * 60 * 1000;
/** Days until the next review after the 1st, 2nd, 3rd... successful solve. */
export const REVIEW_DAYS = [1, 3, 7, 21, 60];

interface Entry {
  attempts: number;
  passes: number;
  hintsUsed: number;
  revealed: boolean;
  solvedAt: string | null;
  dueAt: string | null;
  reviewCount: number;
  inReview: boolean;
  lastAttemptAt: string | null;
}

interface FileShape {
  version: number;
  exercises: Record<string, Entry>;
}

const blank = (): Entry => ({
  attempts: 0,
  passes: 0,
  hintsUsed: 0,
  revealed: false,
  solvedAt: null,
  dueAt: null,
  reviewCount: 0,
  inReview: false,
  lastAttemptAt: null,
});

/**
 * Progress and spaced-repetition state, stored as a small JSON file in the
 * learner's dojo folder so it can be read, diffed and committed.
 */
export class ProgressStore extends EventEmitter {
  private data: FileShape | null = null;

  constructor(
    readonly file: string,
    private readonly clock: () => number = Date.now,
  ) {
    super();
  }

  private load(): FileShape {
    if (this.data) return this.data;
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    } catch {
      /* first run, or unreadable: start fresh */
    }
    const data = (parsed && typeof parsed === 'object' ? parsed : {}) as Partial<FileShape>;
    this.data = { version: 1, exercises: data.exercises && typeof data.exercises === 'object' ? data.exercises : {} };
    return this.data;
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, `${JSON.stringify(this.load(), null, 2)}\n`);
    fs.renameSync(tmp, this.file);
    this.emit('change');
  }

  private entry(id: string): Entry {
    const d = this.load();
    if (!d.exercises[id]) d.exercises[id] = blank();
    return d.exercises[id];
  }

  /** Forget the in-memory copy so the next read goes back to disk. */
  reload(): void {
    this.data = null;
    this.emit('change');
  }

  view(id: string): ProgressView {
    const e = this.load().exercises[id] ?? blank();
    const due = Boolean(e.solvedAt && !e.inReview && e.dueAt && Date.parse(e.dueAt) <= this.clock());
    let status: ProgressView['status'] = 'new';
    if (e.inReview) status = 'reviewing';
    else if (due) status = 'review-due';
    else if (e.solvedAt) status = 'solved';
    else if (e.attempts > 0 || e.hintsUsed > 0) status = 'started';
    return {
      status,
      attempts: e.attempts,
      passes: e.passes,
      hintsUsed: e.hintsUsed,
      revealed: e.revealed,
      solvedAt: e.solvedAt,
      dueAt: e.dueAt,
      reviewCount: e.reviewCount,
      inReview: e.inReview,
    };
  }

  /** Call after every full test run. `passedAll` is true only when every test passed. */
  recordTestRun(id: string, passedAll: boolean): ProgressView {
    const e = this.entry(id);
    const now = this.clock();
    e.attempts += 1;
    e.lastAttemptAt = new Date(now).toISOString();
    if (passedAll) {
      e.passes += 1;
      const wasReview = e.inReview;
      if (!e.solvedAt || wasReview) {
        if (wasReview && !e.revealed) e.reviewCount += 1;
        e.solvedAt = new Date(now).toISOString();
        e.inReview = false;
        // Peeking at the reference solution earns a quick second look.
        const days = e.revealed ? 1 : REVIEW_DAYS[Math.min(e.reviewCount, REVIEW_DAYS.length - 1)];
        e.dueAt = new Date(now + days * DAY).toISOString();
      }
    }
    this.save();
    return this.view(id);
  }

  /** Hands out the next hint's index, or null when they have all been used. */
  useHint(id: string, total: number): number | null {
    const e = this.entry(id);
    if (e.hintsUsed >= total) return null;
    e.hintsUsed += 1;
    this.save();
    return e.hintsUsed - 1;
  }

  markRevealed(id: string): ProgressView {
    this.entry(id).revealed = true;
    this.save();
    return this.view(id);
  }

  /** Starts a fresh attempt at an already solved exercise. */
  startReview(id: string): ProgressView | null {
    const e = this.entry(id);
    if (!e.solvedAt) return null;
    e.inReview = true;
    e.hintsUsed = 0;
    e.revealed = false;
    this.save();
    return this.view(id);
  }
}

/**
 * Progress for one language. Exercise ids repeat across languages (both have f01...),
 * so the store keeps entries as "<language>:<id>"; this view hides the prefix.
 */
export class LanguageProgress {
  constructor(
    private readonly store: ProgressStore,
    readonly language: LanguageId,
  ) {}

  private key(id: string): string {
    return `${this.language}:${id}`;
  }

  view(id: string): ProgressView {
    return this.store.view(this.key(id));
  }

  recordTestRun(id: string, passedAll: boolean): ProgressView {
    return this.store.recordTestRun(this.key(id), passedAll);
  }

  useHint(id: string, total: number): number | null {
    return this.store.useHint(this.key(id), total);
  }

  markRevealed(id: string): ProgressView {
    return this.store.markRevealed(this.key(id));
  }

  startReview(id: string): ProgressView | null {
    return this.store.startReview(this.key(id));
  }

  reload(): void {
    this.store.reload();
  }
}
