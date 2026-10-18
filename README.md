# Dojo: C++ and Go

A local learning environment for **C/C++** and **Go**, with **graph traversal** and **matrix transforms** in both (and a short syntax primer for Go). You solve exercises by writing code yourself; the app compiles it, runs real tests, and has a tutor you can ask, but the tutor is told not to hand you the answer.

**Switch language** with the `C++ | Go` toggle in the top bar (or open `http://localhost:4173/?lang=go`). Each language has its own exercises, saved solutions, progress, review schedule and tutor chat, so you can move back and forth freely. The app remembers the last language you used.

```
+------------+-------------------------+------------+
| Exercise   |  Code editor (Monaco)   |  Tutor     |
| + hints    |                         |  (Ollama)  |
| + path     +-------------------------+            |
|            |  Terminal / test output |            |
+------------+-------------------------+------------+
```

## Quick start

You need **Node.js 18+**, **Ollama** for the tutor, and the toolchain for each language you want to use: a **C++ compiler** and/or **Go 1.22+**. A language whose toolchain is missing still opens (so you can read the exercises) and tells you what to install.

```sh
npm install
npm start            # then open http://localhost:4173
# npm start -- --open   opens the browser for you
```

**Compiler.** On macOS run `xcode-select --install` once if `clang++ --version` fails. On Linux install `g++` or `clang`. The app prefers `g++`/`clang++` with `-std=c++20` (falls back to C++17) and turns on AddressSanitizer + UndefinedBehaviorSanitizer when your toolchain has them, so out-of-bounds access, use-after-free and signed overflow show up as readable errors instead of silent corruption. The top bar shows which compiler it found. To force one: `CXX=g++-14 npm start`.

**Go.** Install from <https://go.dev/dl/> (or `brew install go`). The app looks for `go` on your `PATH`, then in the usual install locations; to force one: `GO=/path/to/go npm start`. Each build runs in a throw-away module under `build/go/` with `GOTOOLCHAIN=local`, so nothing is downloaded and your own modules are untouched. The module's language version follows your toolchain; the exercises themselves only need Go 1.22. If your machine can build with `-race` (needs cgo and a C compiler), the app turns the race detector on and the top bar says so.

**Tutor.** Install [Ollama](https://ollama.com), then:

```sh
ollama serve              # if it is not already running
ollama pull qwen2.5-coder:7b   # or any chat model you like
```

Pick the model in the dropdown at the top of the chat pane. Nothing leaves your machine. If Ollama is somewhere else, set `OLLAMA_URL=http://host:11434` before `npm start`. The app works fine without the tutor; the chat just says it cannot connect.

## How a session works

1. Open an exercise. Read **Concept** (the idea) and **Your task** (the exact functions to write).
2. Write your solution in the editor. It is saved automatically to `work/<language>/<exercise-id>/solution.cpp` (or `solution.go`).
3. **Run tests** (`Ctrl/Cmd+Enter`) compiles your file against the exercise's tests. Failures show the line, what was expected and what you returned.
4. **Run** (`Ctrl/Cmd+Shift+Enter`) runs your own `main()` for experiments; the terminal accepts keyboard input. `Ctrl+C` stops a program. In Go, **gofmt** (`Shift+Alt+F`) formats your file; if it does not parse yet it says why and leaves your code alone.
5. Stuck? Ask the tutor, or reveal **hints**. They go from nudge to near-spoiler. The reference solution unlocks only after you have run the tests at least once *and* used every hint. Looking at it schedules the exercise for review tomorrow.
6. When all tests pass the exercise is marked solved. The **Path** tab shows the track and which exercises are due for review.

**Autocomplete is off by default**, on purpose: recalling syntax is part of learning it. Tick the box if you want it.

**Spaced review.** Solved exercises come back after 1, 3, 7, 21 and 60 days. **Practise again** archives your old solution to `work/<language>/<id>/history/` and gives you the blank starter, so you re-derive it instead of re-reading it.

**Tutor modes.** *Socratic* (questions and nudges), *Explain* (concepts, no solution), *Show code* (may show code and then asks you to retype it). By default the tutor sees your code and the last output; untick "Share my code" to ask a general question.

## Curriculum

### C++ (32 exercises)

| Track | Exercises |
|-------|-----------|
| **C & C++ Foundations** (12) | integer overflow, pointers, arrays & pointer arithmetic, C strings, structs & references, `malloc`/`free`, a RAII class, `vector` & algorithms, maps & sets, linked list, stack & queue, heaps & comparators |
| **Graph Traversal** (12) | adjacency lists, BFS, recursive DFS, iterative DFS, shortest paths, grid mazes, connected components, cycle detection, topological sort, union-find (+ Kruskal), Dijkstra, multi-source BFS |
| **Matrices & Transforms** (8) | grid basics, a flat-storage `Matrix` class, rotation, spiral traversal, multiplication & fast powers, 2D point transforms, homogeneous 3x3 matrices, transform pipelines |

Start with the foundations if you have not written real C/C++ before; you can open any exercise at any time.

### Go (42 exercises)

| Track | Exercises |
|-------|-----------|
| **Go Syntax Primer** (9) | values, types and `fmt`; `for`/`if`/`switch`; functions, errors and `defer`; arrays, slices and `append`; maps and strings; structs, methods and pointers; interfaces and type switches; closures and generics; goroutines, channels and `select` |
| **Go Foundations** (13) | integer wraparound; pointers; slice internals; strings, bytes and runes; struct value semantics and embedding; a growable generic stack; cleanup with `defer`; sorting and binary search; maps and a generic `Set`; linked lists; stacks and queues; heaps with `container/heap`; concurrency patterns |
| **Graph Traversal** (12) | the same twelve problems as C++, rewritten for Go |
| **Matrices & Transforms** (8) | the same eight problems as C++, rewritten for Go (slices instead of `std::vector`, `container/heap` instead of `priority_queue`, defined integer wraparound instead of undefined behaviour) |

The primer is deliberately brief; if you already write Go, skip it.

## Layout

```
languages/cpp/{exercises,reference,include}   C++ catalogue, reference solutions, test harness (dojo.h)
languages/go/{exercises,reference,include}    Go catalogue, reference solutions, test helpers (dojo_test.go)
server/languages.js                           the registry of languages (file names, tutor wording, ...)
server/runners/{cpp,go}.js                    compile/build, run and test for each language
```

## Adding your own exercises

Each exercise is a folder `languages/<lang>/exercises/<track>/<id>/` (new tracks go in that folder's `tracks.json`):

- `exercise.json`: title, summary, concepts, minutes, and at least 3 hints
- `prompt.md`: the text shown on the left
- the starter, test and reference files below
- `languages/<lang>/reference/<id>/`: your own answer

**C++:** `starter.cpp` (stubs, plus a scratch `main()` wrapped in `#ifndef DOJO_TEST`) and `test.cpp` (`#include "dojo.h"`, then `#include "solution.cpp"`, then `TEST(name) { CHECK_EQ(...); }`, ending with `int main() { return dojo::run_all(); }`); reference `solution.cpp`. `languages/cpp/include/dojo.h` is the tiny harness (`CHECK`, `CHECK_EQ`, `CHECK_NEAR`, `INFO`, plus opt-in `new`/`delete`/`malloc` leak tracking).

**Go:** `starter.go` (`package main`, stubs that compile but fail the tests, and a scratch `func main()`) and `solution_test.go` (ordinary tests in `package main`); reference `solution.go`. `languages/go/include/dojo_test.go` is copied next to every build and provides `Equal(t, got, want)`, `True`, `False` and `Near`, each with optional trailing context. `Equal` compares deeply and requires both values to have the same type (write `int64(7)`, not `7`, for an `int64`). Name test helpers with a distinctive prefix (this repo uses `chk...`) so they cannot clash with a learner's own function names.

Run `npm run verify` to check that every starter *fails* and every reference *passes* for each installed toolchain (Go with the module language pinned to 1.22). Narrow it with `--lang` and id prefixes: `node scripts/verify.js --lang go g0 m01`.

## Limits worth knowing

- The "terminal" streams your program's output and lets you type input, but it is **not a real pseudo-terminal**: no shell, no full-screen programs, line editing is handled in the browser.
- The server listens on `127.0.0.1` only and rejects foreign `Host`/`Origin` headers. It compiles and runs code you write, with time and output limits (Go tests: 8 seconds each, 60 seconds for Run), but **without a sandbox**: only run code you wrote yourself.
- Reference solutions are plain files in `reference/`. The app gates them, your own discipline guards the folder.
- The UI was tested in headless Chromium; the exercises were verified with g++ and clang++ on Linux. Expect small rough edges on your machine.
- The Go side of the combined app was merged from the former standalone `go-dojo/` and tested with Go 1.27 on macOS; C++ was verified with clang++ on macOS and g++/clang++ on Linux.
