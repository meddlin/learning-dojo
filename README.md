# C++ Dojo

> Looking for Go? The same dojo for Go (with a syntax primer) lives in [`go-dojo/`](go-dojo/README.md).

A local learning environment for **C/C++**, **graph traversal** and **matrix transforms**. You solve exercises by writing code yourself; the app compiles it, runs real tests, and has a tutor you can ask, but the tutor is told not to hand you the answer.

```
+------------+-------------------------+------------+
| Exercise   |  Code editor (Monaco)   |  Tutor     |
| + hints    |                         |  (Ollama)  |
| + path     +-------------------------+            |
|            |  Terminal / test output |            |
+------------+-------------------------+------------+
```

## Quick start

You need **Node.js 18+**, a **C++ compiler**, and (for the tutor) **Ollama**.

```sh
cd cpp-dojo
npm install
npm start            # then open http://localhost:4173
# npm start -- --open   opens the browser for you
```

**Compiler.** On macOS run `xcode-select --install` once if `clang++ --version` fails. On Linux install `g++` or `clang`. The app prefers `g++`/`clang++` with `-std=c++20` (falls back to C++17) and turns on AddressSanitizer + UndefinedBehaviorSanitizer when your toolchain has them, so out-of-bounds access, use-after-free and signed overflow show up as readable errors instead of silent corruption. The top bar shows which compiler it found. To force one: `CXX=g++-14 npm start`.

**Tutor.** Install [Ollama](https://ollama.com), then:

```sh
ollama serve              # if it is not already running
ollama pull qwen2.5-coder:7b   # or any chat model you like
```

Pick the model in the dropdown at the top of the chat pane. Nothing leaves your machine. If Ollama is somewhere else, set `OLLAMA_URL=http://host:11434` before `npm start`. The app works fine without the tutor; the chat just says it cannot connect.

## How a session works

1. Open an exercise. Read **Concept** (the idea) and **Your task** (the exact functions to write).
2. Write your solution in the editor. It is saved automatically to `work/<exercise-id>/solution.cpp`.
3. **Run tests** (`Ctrl/Cmd+Enter`) compiles your file against the exercise's tests. Failures show the line, what was expected and what you returned.
4. **Run** (`Ctrl/Cmd+Shift+Enter`) runs your own `main()` for experiments; the terminal accepts keyboard input. `Ctrl+C` stops a program.
5. Stuck? Ask the tutor, or reveal **hints**. They go from nudge to near-spoiler. The reference solution unlocks only after you have run the tests at least once *and* used every hint. Looking at it schedules the exercise for review tomorrow.
6. When all tests pass the exercise is marked solved. The **Path** tab shows the track and which exercises are due for review.

**Autocomplete is off by default**, on purpose: recalling syntax is part of learning it. Tick the box if you want it.

**Spaced review.** Solved exercises come back after 1, 3, 7, 21 and 60 days. **Practise again** archives your old solution to `work/<id>/history/` and gives you the blank starter, so you re-derive it instead of re-reading it.

**Tutor modes.** *Socratic* (questions and nudges), *Explain* (concepts, no solution), *Show code* (may show code and then asks you to retype it). By default the tutor sees your code and the last output; untick "Share my code" to ask a general question.

## Curriculum (32 exercises)

| Track | Exercises |
|-------|-----------|
| **C & C++ Foundations** (12) | integer overflow, pointers, arrays & pointer arithmetic, C strings, structs & references, `malloc`/`free`, a RAII class, `vector` & algorithms, maps & sets, linked list, stack & queue, heaps & comparators |
| **Graph Traversal** (12) | adjacency lists, BFS, recursive DFS, iterative DFS, shortest paths, grid mazes, connected components, cycle detection, topological sort, union-find (+ Kruskal), Dijkstra, multi-source BFS |
| **Matrices & Transforms** (8) | grid basics, a flat-storage `Matrix` class, rotation, spiral traversal, multiplication & fast powers, 2D point transforms, homogeneous 3x3 matrices, transform pipelines |

Start with the foundations if you have not written real C/C++ before; you can open any exercise at any time.

## Adding your own exercises

Each exercise is a folder `exercises/<track>/<id>/`:

- `exercise.json`: title, summary, concepts, minutes, and at least 3 hints
- `prompt.md`: the text shown on the left
- `starter.cpp`: stubs, plus a scratch `main()` wrapped in `#ifndef DOJO_TEST`
- `test.cpp`: `#include "dojo.h"`, then `#include "solution.cpp"`, then `TEST(name) { CHECK_EQ(...); }`, ending with `int main() { return dojo::run_all(); }`
- `reference/<id>/solution.cpp`: your own answer

`include/dojo.h` is the tiny test harness (`CHECK`, `CHECK_EQ`, `CHECK_NEAR`, `INFO`, plus opt-in `new`/`delete`/`malloc` leak tracking). Run `npm run verify` to check that every starter *fails* and every reference *passes*; pass an id prefix to check just one (`node scripts/verify.js g0`).

## Limits worth knowing

- The "terminal" streams your program's output and lets you type input, but it is **not a real pseudo-terminal**: no shell, no full-screen programs, line editing is handled in the browser.
- The server listens on `127.0.0.1` only and rejects foreign `Host`/`Origin` headers. It compiles and runs code you write, with time and output limits, but **without a sandbox**: only run code you wrote yourself.
- Reference solutions are plain files in `reference/`. The app gates them, your own discipline guards the folder.
- The UI was tested in headless Chromium; the exercises were verified with g++ and clang++ on Linux. Expect small rough edges on your machine.
