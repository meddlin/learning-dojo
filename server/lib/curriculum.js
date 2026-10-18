'use strict';
// Reads one language's exercise catalogue from disk. Nothing is cached, so
// editing an exercise's files takes effect on the next request.
// Use `forLanguage(lang)` to get the functions bound to that language pack.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const ID_RE = /^[a-z][a-z0-9-]{1,60}$/;

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function forLanguage(lang) {
  const EXERCISES = path.join(lang.dir, 'exercises');
  const REFERENCE = path.join(lang.dir, 'reference');
  const WORK = path.join(ROOT, 'work', lang.id);

  function loadExercise(trackId, id) {
    const dir = path.join(EXERCISES, trackId, id);
    const meta = readJson(path.join(dir, 'exercise.json'), null);
    if (!meta) return null;
    return {
      id,
      track: trackId,
      dir,
      title: meta.title || id,
      summary: meta.summary || '',
      concepts: meta.concepts || [],
      minutes: meta.minutes || null,
      hints: Array.isArray(meta.hints) ? meta.hints : [],
    };
  }

  function listTracks() {
    const tracks = readJson(path.join(EXERCISES, 'tracks.json'), []);
    return tracks.map((t) => {
      const trackDir = path.join(EXERCISES, t.id);
      let names = [];
      try {
        names = fs
          .readdirSync(trackDir, { withFileTypes: true })
          .filter((d) => d.isDirectory())
          .map((d) => d.name)
          .sort();
      } catch {
        /* track directory missing: show it empty */
      }
      const exercises = names.map((n) => loadExercise(t.id, n)).filter(Boolean);
      return { ...t, exercises };
    });
  }

  function allExercises() {
    return listTracks().flatMap((t) => t.exercises);
  }

  function findExercise(id) {
    if (typeof id !== 'string' || !ID_RE.test(id)) return null;
    return allExercises().find((e) => e.id === id) || null;
  }

  function readPrompt(ex) {
    try {
      return fs.readFileSync(path.join(ex.dir, 'prompt.md'), 'utf8');
    } catch {
      return '*This exercise has no prompt yet.*';
    }
  }

  function starterCode(ex) {
    return fs.readFileSync(path.join(ex.dir, lang.starterFile), 'utf8');
  }

  function workDir(ex) {
    return path.join(WORK, ex.id);
  }

  function workFile(ex) {
    return path.join(workDir(ex), lang.solutionFile);
  }

  function readCode(ex) {
    try {
      return fs.readFileSync(workFile(ex), 'utf8');
    } catch {
      return starterCode(ex);
    }
  }

  function writeCode(ex, code) {
    fs.mkdirSync(workDir(ex), { recursive: true });
    fs.writeFileSync(workFile(ex), code);
  }

  // Saves whatever is in the work file under work/<id>/history/ and restores the starter.
  function archiveAndReset(ex) {
    const current = readCode(ex);
    const starter = starterCode(ex);
    if (current.trim() && current !== starter) {
      const hist = path.join(workDir(ex), 'history');
      fs.mkdirSync(hist, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.writeFileSync(path.join(hist, `${stamp}.${lang.fileExt}`), current);
    }
    writeCode(ex, starter);
    return starter;
  }

  function referenceDir(ex) {
    return path.join(REFERENCE, ex.id);
  }

  function readReference(ex) {
    try {
      return fs.readFileSync(path.join(referenceDir(ex), lang.solutionFile), 'utf8');
    } catch {
      return null;
    }
  }

  return {
    listTracks,
    allExercises,
    findExercise,
    readPrompt,
    starterCode,
    workDir,
    workFile,
    readCode,
    writeCode,
    archiveAndReset,
    referenceDir,
    readReference,
  };
}

module.exports = { ROOT, ID_RE, forLanguage };
