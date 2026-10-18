'use strict';
// Progress tracking with simple spaced repetition. Stored in progress.json at
// the project root; writes are atomic (temp file + rename). Exercise ids repeat
// across languages (both have f01...), so entries are keyed "<language>:<id>".
// `forLanguage(lang)` returns the per-exercise functions bound to one language.

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./curriculum');

const FILE = path.join(ROOT, 'progress.json');
const DAY = 24 * 60 * 60 * 1000;
// Days until the next review after the 1st, 2nd, 3rd... successful solve.
const REVIEW_DAYS = [1, 3, 7, 21, 60];

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    cache = null;
  }
  if (!cache || typeof cache !== 'object') cache = {};
  cache.version = 1;
  cache.exercises = cache.exercises || {};
  cache.settings = cache.settings || {};
  // Progress written before languages existed used bare C++ exercise ids.
  for (const k of Object.keys(cache.exercises)) {
    if (!k.includes(':')) {
      cache.exercises[`cpp:${k}`] = cache.exercises[k];
      delete cache.exercises[k];
    }
  }
  return cache;
}

function save() {
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(load(), null, 2));
  fs.renameSync(tmp, FILE);
}

function entry(id) {
  const p = load();
  if (!p.exercises[id]) {
    p.exercises[id] = {
      attempts: 0,
      passes: 0,
      hintsUsed: 0,
      revealed: false,
      solvedAt: null,
      dueAt: null,
      reviewCount: 0,
      inReview: false,
      lastAttemptAt: null,
    };
  }
  return p.exercises[id];
}

function view(id) {
  const e = load().exercises[id] || entry(id);
  const now = Date.now();
  const due = Boolean(e.solvedAt && !e.inReview && e.dueAt && Date.parse(e.dueAt) <= now);
  let status = 'new';
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

// Called after every test run. `passedAll` is true only when every test passed.
function recordTestRun(id, passedAll) {
  const e = entry(id);
  const now = Date.now();
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
  save();
  return view(id);
}

// Hands out the next hint, or returns null when they have all been used.
function useHint(id, total) {
  const e = entry(id);
  if (e.hintsUsed >= total) return null;
  e.hintsUsed += 1;
  save();
  return e.hintsUsed - 1;
}

function markRevealed(id) {
  entry(id).revealed = true;
  save();
  return view(id);
}

// Starts a fresh attempt at an already solved exercise.
function startReview(id) {
  const e = entry(id);
  if (!e.solvedAt) return null;
  e.inReview = true;
  e.hintsUsed = 0;
  e.revealed = false;
  save();
  return view(id);
}

function getSettings() {
  return { ...load().settings };
}

function setSettings(patch) {
  const s = load().settings;
  for (const k of ['model', 'mode']) {
    if (typeof patch[k] === 'string' && patch[k].length < 200) s[k] = patch[k];
  }
  save();
  return getSettings();
}

function forLanguage(langId) {
  const k = (id) => `${langId}:${id}`;
  return {
    view: (id) => view(k(id)),
    recordTestRun: (id, passedAll) => recordTestRun(k(id), passedAll),
    useHint: (id, total) => useHint(k(id), total),
    markRevealed: (id) => markRevealed(k(id)),
    startReview: (id) => startReview(k(id)),
  };
}

module.exports = { forLanguage, getSettings, setSettings };
