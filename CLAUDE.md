# Learning Dojo: project notes for Claude Code

A VS Code extension (TypeScript, bundled with esbuild, no runtime dependencies) for learning C/C++ and Go (graph traversal and matrix transforms) and Python (basics, data structures, files/CSV, pandas) by solving 104 exercises (32 C++, 42 Go, 30 Python). The learner switches between the three languages. It was converted from a standalone browser app (`f717a14`, then the Go port and language switch merged in PRs #1 and #2). The tutor is a custom webview backed by a local Ollama model, not a native `@dojo` chat participant. The goal is to publish it to the VS Code Marketplace and Open VSX.

## Commands

```bash
npm install
npm run typecheck     # tsc --noEmit
npm run build         # dist/extension.js
npm test              # core.test.ts + extension.test.ts (fake vscode API); runner tests skip when a toolchain is missing
npm run verify        # builds every exercise of each installed language: starters must fail, references must pass (C++/Go ~5 min each, Python ~1 min). Options: --lang cpp|go|python, id prefixes; PYTHON=<interpreter with pandas>
npm run package       # .vsix (add -- --skip-license until a LICENSE exists)
```

Debug with F5 ("Run Extension" in `.vscode/launch.json`).

## Layout

- `src/core/`: no `vscode` imports; unit-testable.
  - Languages: `languages` (a `LanguagePack` per language: file names, test-name parsing, tutor wording), `toolchain` (a `Backend` per language: detect, build, run tests, parse diagnostics; `ToolchainProvider` caches detection), `cpp` (clang++/g++, c++20→17, sanitizers; the test binary writes `DOJO_RESULT_FILE` JSON), `go` (go ≥1.22, optional `-race`; throw-away module per job, `go test -c`, one process for all tests, re-run in a fresh process after a panic or hang), `goOutput` (pure `go test -v` parsing), `python` (python ≥3.10; detection prefers an interpreter with pandas and looks in `~/.dojo-venv`; tests run via `languages/python/include/dojo_runner.py`, which emits one JSON event per test on stdout and sends learner prints to stderr; re-runs the remaining tests in a fresh process after a crash or hang; "build" is only a syntax check and returns the interpreter command that Run starts), `runner` (types shared by both backends), `exec`.
  - `catalog` (`Catalogs` holds one `Catalog` per language, read from `languages/<id>/`), `progress` (spaced review 1/3/7/21/60 days, atomic JSON; `LanguageProgress` prefixes keys `<lang>:<id>`), `workdir` (`<root>/<lang>/<track>/<id>/solution.<ext>`, history/), `diagnostics` (gcc/clang and `go build` output parsers; the Python runner prints errors in the gcc format), `tutor` (Ollama NDJSON streaming, system prompts for socratic/explain/code, per-language wording).
- `src/session.ts`: dojo folder, ProgressStore, the **current language** (persisted) and the current exercise per language, events. `src/exercises.ts`: run/reset/hints/reveal/diagnostics/terminal; in-memory state is keyed `<lang>:<id>`. `src/testing.ts`: Test Explorer controller (current language only). `src/pathView.ts`: tree view. `src/panel.ts`: exercise webview. `src/tutorView.ts`: tutor webview. `src/extension.ts`: wiring, commands and the language switch (status bar item, Path view button, `dojo.switchLanguage`; focusing a solution file of the other language switches too). `src/folder.ts`, `src/practiceMode.ts`, `src/webviewHtml.ts` (nonce CSP).
- `media/`: webview JS/CSS (`render.js` is a small safe Markdown renderer plus C++, Go and Python highlighters, exposed as `window.DojoRender`).
- `languages/<id>/` (`cpp`, `go`, `python`): `exercises/tracks.json`, `exercises/<track>/<id>/{exercise.json,prompt.md,starter.*,test.cpp|solution_test.go|test_solution.py}`, `reference/<id>/solution.*`, `include/{dojo.h|dojo_test.go|dojo_test.py,dojo_runner.py}`. Exercise ids repeat across languages. See `docs/ADDING-EXERCISES.md`.
- User data lives in the learner's chosen dojo folder (`.dojo/progress.json`, `<lang>/<track>/<id>/solution.*`, `history/`), never in the extension. `.legacy/` holds the old standalone app's data and is gitignored.

## State of things

- Tested: the core library (including the real Go, C++ and Python runners) and the whole extension flow for all three languages, language switching included, against a fake `vscode` module (`test/fake-vscode.ts`). The webviews were last checked in headless Chromium with a stubbed `acquireVsCodeApi` before the language switch was added, so re-check the language label in the exercise header and the tutor.
- **Never run in real VS Code yet.** Check by hand: the Test Results panel focus command in `Testing.runExercise`, `createTerminal({ shellPath: binary })` for "Run" (a Go binary too), the Activity Bar icon (`media/dojo.svg`), the view-title (language button, icon order) and context menus, the language status bar item, opening a Go solution with no `go.mod` (gopls ad-hoc package), Python Run (`createTerminal({ shellPath: python, shellArgs })`) and Pylance resolving `import pandas` in `solution.py` (it may pick a different interpreter than `dojo.python.path`), panel layout (exercise left, editor right), and the tutor against a real Ollama.
- The Python curriculum was verified with Python 3.15 + pandas 3.1 and Python 3.13 + pandas 2.3. Python tests import `solution` explicitly and use `dojo_test` helpers; starters `raise NotImplementedError`.
- C++ tests expect `test.cpp` to include `dojo.h` then `solution.cpp`; Go tests are `package main` files next to `solution.go`. A mangled solution (for example an unclosed paren) makes clang report errors in test.cpp, so nothing is underlined; the raw output opens in the "Learning Dojo" output channel instead.

## Open decisions and ideas

- Licence: `package.json` says `UNLICENSED` and there is no LICENSE file. Decide for code and for `languages/`.
- Publisher id is a placeholder (`meddlin`); see `docs/PUBLISHING.md`.
- Later: a gofmt command for Go, using the VS Code Python extension's selected interpreter, debugger integration (cppdbg/lldb, delve), `vscode.lm` as an alternative tutor backend, Windows toolchain polish (MinGW/clang only, no MSVC), restoring the exercise panel after a VS Code restart (webview serializer), Open VSX publishing.
