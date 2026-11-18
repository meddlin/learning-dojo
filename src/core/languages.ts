import { goTestNames, prettyName } from './goOutput';
import { pythonPrettyName, pythonTestNames } from './python';
import type { LanguageId } from './types';

export const DEFAULT_LANGUAGE: LanguageId = 'cpp';

/** How the tutor should talk about a language. */
export interface TutorFlavour {
  course: string;
  learner: string;
  style: string;
  connect: string;
}

/** Everything about a language that is data or a pure function (no processes, no VS Code). */
export interface LanguagePack {
  id: LanguageId;
  label: string;
  /** File extension without the dot. */
  fileExt: string;
  starterFile: string;
  solutionFile: string;
  testFile: string;
  /** Markdown fence tag used when showing this language's code. */
  fenceTag: string;
  /** Starts a line comment ("//" or "#"). */
  lineComment: string;
  /** What the "Run" step is called: compiling, or only checking the syntax. */
  buildVerb: string;
  /** Names of the test cases in a test file's source, in the order they run. */
  testNames(source: string): string[];
  /** The name a test case has in `TestResults` (and so in the UI). */
  resultName(testName: string): string;
  tutor: TutorFlavour;
}

export const CPP: LanguagePack = {
  id: 'cpp',
  label: 'C++',
  fileExt: 'cpp',
  starterFile: 'starter.cpp',
  solutionFile: 'solution.cpp',
  testFile: 'test.cpp',
  fenceTag: 'cpp',
  lineComment: '//',
  buildVerb: 'Compiling',
  testNames: (src) => [...src.matchAll(/^\s*TEST\(\s*([A-Za-z_]\w*)\s*\)/gm)].map((m) => m[1]),
  resultName: (name) => name,
  tutor: {
    course: 'a VS Code extension for learning C and C++, data structures and algorithms (graph traversal, then matrix transforms)',
    learner: 'an experienced programmer who knows C-style syntax but has never written substantial C or C++',
    style: 'Mention undefined behaviour, ownership and lifetimes when they matter.',
    connect:
      'Connect ideas to what they already know from other C-style languages, and call out where C and C++ differ (memory, undefined behaviour, value semantics).',
  },
};

export const GO: LanguagePack = {
  id: 'go',
  label: 'Go',
  fileExt: 'go',
  starterFile: 'starter.go',
  solutionFile: 'solution.go',
  testFile: 'solution_test.go',
  fenceTag: 'go',
  lineComment: '//',
  buildVerb: 'Compiling',
  testNames: goTestNames,
  resultName: prettyName,
  tutor: {
    course: 'a VS Code extension for learning the Go programming language and data structures and algorithms (a syntax primer, foundations, graph traversal, then matrix transforms)',
    learner: 'an experienced programmer who has not written much Go',
    style:
      'Prefer idiomatic Go (gofmt style, errors as values, small interfaces, the standard library) and mention slice aliasing, nil, zero values and goroutine leaks when they matter.',
    connect:
      'Connect ideas to what they already know from other languages, and call out where Go differs (value semantics, slices vs arrays, nil, interfaces, errors as values, garbage collection, goroutines).',
  },
};

export const PYTHON: LanguagePack = {
  id: 'python',
  label: 'Python',
  fileExt: 'py',
  starterFile: 'starter.py',
  solutionFile: 'solution.py',
  testFile: 'test_solution.py',
  fenceTag: 'python',
  lineComment: '#',
  buildVerb: 'Checking',
  testNames: pythonTestNames,
  resultName: pythonPrettyName,
  tutor: {
    course:
      'a VS Code extension for learning Python: the basics, built-in data structures, reading and writing files such as CSV, and data analysis with pandas',
    learner: 'an experienced programmer who wants to get fluent in Python and pandas',
    style:
      'Prefer idiomatic, readable Python (PEP 8, comprehensions where they help, the standard library, `with` for files) and, for pandas, vectorised operations over loops and `apply`. Mention mutability and aliasing, truthiness, and the SettingWithCopy / copy-on-write behaviour of pandas when they matter.',
    connect:
      'Connect ideas to what they already know from other languages, and call out where Python differs (dynamic typing, everything is an object and names are references, indentation, iterators and generators, duck typing, and for pandas: the index, dtypes and broadcasting).',
  },
};

export const LANGUAGES: Record<LanguageId, LanguagePack> = { cpp: CPP, go: GO, python: PYTHON };
export const LANGUAGE_IDS = Object.keys(LANGUAGES) as LanguageId[];

export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANGUAGES, value);
}
