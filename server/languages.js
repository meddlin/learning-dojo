'use strict';
// The languages the dojo can teach. Each one is a "pack": an exercise catalogue
// under languages/<id>/, a runner (server/runners/<id>.js) and the few strings
// the server, tutor and UI need. To add a language, add a pack here, a runner
// and a languages/<id>/ folder.

const path = require('path');

const DEFAULT_LANGUAGE = 'cpp';

const LANGUAGES = {
  cpp: {
    id: 'cpp',
    label: 'C++',
    dir: path.join(__dirname, '..', 'languages', 'cpp'),
    fileExt: 'cpp',
    starterFile: 'starter.cpp',
    solutionFile: 'solution.cpp',
    testFile: 'test.cpp',
    monaco: 'cpp',
    fenceTags: ['cpp', 'c++', 'c', 'h', 'hpp', 'cc'],
    insertSpaces: true,
    canFormat: false,
    runner: () => require('./runners/cpp'),
    tutor: {
      course: 'a local learning environment for C and C++, data structures and algorithms (graph traversal, then matrix transforms)',
      learner: 'an experienced programmer who knows C-style syntax but has never written substantial C or C++',
      style: 'Mention undefined behaviour, ownership and lifetimes when they matter.',
      connect: 'Connect ideas to what they already know from other C-style languages, and call out where C and C++ differ (memory, undefined behaviour, value semantics).',
    },
  },
  go: {
    id: 'go',
    label: 'Go',
    dir: path.join(__dirname, '..', 'languages', 'go'),
    fileExt: 'go',
    starterFile: 'starter.go',
    solutionFile: 'solution.go',
    testFile: 'solution_test.go',
    monaco: 'go',
    fenceTags: ['go', 'golang'],
    insertSpaces: false,
    canFormat: true,
    runner: () => require('./runners/go'),
    tutor: {
      course: 'a local learning environment for the Go programming language and for data structures and algorithms (a syntax primer, foundations, graph traversal, then matrix transforms)',
      learner: 'an experienced programmer who has not written much Go',
      style: 'Prefer idiomatic Go (gofmt style, errors as values, small interfaces, the standard library) and mention slice aliasing, nil, zero values and goroutine leaks when they matter.',
      connect: 'Connect ideas to what they already know from other languages, and call out where Go differs (value semantics, slices vs arrays, nil, interfaces, errors as values, garbage collection, goroutines).',
    },
  },
};

function getLanguage(id) {
  return Object.prototype.hasOwnProperty.call(LANGUAGES, id) ? LANGUAGES[id] : null;
}

module.exports = { LANGUAGES, DEFAULT_LANGUAGE, getLanguage };
