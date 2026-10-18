# Go Dojo

A local learning environment for **Go**: a short syntax primer, then data structures, **graph traversal** and **matrix transforms**. You solve exercises by writing code yourself; the app builds it, runs real tests, and has a tutor you can ask, but the tutor is told not to hand you the answer.

It is the Go sibling of the C++ Dojo in the parent folder, with the same shape (editor, terminal, hints, spaced review, local tutor) and the same graph and matrix tracks, rewritten for Go's idioms.

```
+------------+-------------------------+------------+
| Exercise   |  Code editor (Monaco)   |  Tutor     |
| + hints    |                         |  (Ollama)  |
| + path     +-------------------------+            |
|            |  Terminal / test output |            |
+------------+-------------------------+------------+
```

## Quick start

You need **Node.js 18+**, **Go 1.22+**, and (for the tutor) **Ollama**.

```sh
cd go-dojo
npm install
npm start            # then open http://localhost:4173
# npm start -- --open   opens the browser for you
```

**Go.** Install from <https://go.dev/dl/> (or `brew install go`). The app looks for `go` on your `PATH`, then in the usual install locations; to force one: `GO=/path/to/go npm start`. Each build runs in a throw-away module under `build/` with `GOTOOLCHAIN=local`, so nothing is downloaded and your own modules are untouched. The module's language version follows your toolchain, so newer features (iterators, `slices.Sorted`, ...) are yours to use; the exercises themselves only need Go 1.22.

**Race detector.** If your machine can build with `-race` (it needs cgo and a C compiler: on macOS, `xcode-select --install`), the app turns it on, so a missing mutex or an unsynchronised write fails a test with a readable `DATA RACE` report. The top bar shows `race detector` when it is active.

**Tutor.** Install [Ollama](https://ollama.com), then:

```sh
ollama serve              # if it is not already running
ollama pull qwen2.5-coder:7b   # or any chat model you like
```

Pick the model in the dropdown at the top of the chat pane. Nothing leaves your machine. If Ollama is somewhere else, set `OLLAMA_URL=http://host:11434` before `npm start`. The app works fine without the tutor; the chat just says it cannot connect.

## How a session works

1. Open an exercise. Read **Concept** (the idea) and **Your task** (the exact functions to write).
2. Write your solution in the editor. It is saved automatically to `work/<exercise-id>/solution.go`.
3. **Run tests** (`Ctrl/Cmd+Enter`) builds your file against the exercise's tests. Each test function runs in its own process, so a panic, deadlock or infinite loop in one test does not hide the others. Failures show the line, what was expected and what you returned; panics show the stack frames inside your own file.
4. **Run** (`Ctrl/Cmd+Shift+Enter`) runs your own `main()` for experiments; the terminal accepts keyboard input. `Ctrl+C` stops a program.
5. **gofmt** (`Shift+Alt+F`) formats your file the way `gofmt` would. If the file does not parse yet it says why and leaves your code alone.
6. Stuck? Ask the tutor, or reveal **hints**. They go from nudge to near-spoiler. The reference solution unlocks only after you have run the tests at least once *and* used every hint. Looking at it schedules the exercise for review tomorrow.
7. When all tests pass the exercise is marked solved. The **Path** tab shows the tracks and which exercises are due for review.

**Autocomplete is off by default**, on purpose: recalling syntax is part of learning it. Tick the box if you want it.

**Spaced review.** Solved exercises come back after 1, 3, 7, 21 and 60 days. **Practise again** archives your old solution to `work/<id>/history/` and gives you the blank starter, so you re-derive it instead of re-reading it.

**Tutor modes.** *Socratic* (questions and nudges), *Explain* (concepts, no solution), *Show code* (may show code and then asks you to retype it). By default the tutor sees your code and the last output; untick "Share my code" to ask a general question.

## Curriculum (42 exercises)

| Track | Exercises |
|-------|-----------|
| **Go Syntax Primer** (9) | values, types and `fmt`; `for`/`if`/`switch`; functions, errors and `defer`; arrays, slices and `append`; maps and strings; structs, methods and pointers; interfaces and type switches; closures and generics; goroutines, channels and `select` |
| **Go Foundations** (13) | integer wraparound; pointers; slice internals (len, cap, aliasing); strings, bytes and runes; struct value semantics and embedding; a growable generic stack; cleanup with `defer`; sorting and binary search; maps and a generic `Set`; linked lists; stacks and queues; heaps with `container/heap`; concurrency patterns |
| **Graph Traversal** (12) | adjacency lists, BFS, recursive DFS, iterative DFS, shortest paths, grid mazes, connected components, cycle detection, topological sort, union-find (+ Kruskal), Dijkstra, multi-source BFS |
| **Matrices & Transforms** (8) | grid basics, a flat-storage `Matrix` type, rotation, spiral traversal, multiplication & fast powers, 2D point transforms, homogeneous 3x3 matrices, transform pipelines |

The **primer is deliberately brief**: each exercise opens with a compact tour of one area of syntax and asks for a handful of small functions. If you already write Go, skip it. If you know another language, do the primer in an afternoon and then continue with Foundations. The graph and matrix tracks are ports of the C++ Dojo's, with the language-specific lessons swapped (slices instead of `std::vector`, `container/heap` instead of `priority_queue`, defined integer wraparound instead of undefined behaviour, goroutine stacks that grow instead of a fixed call stack).

Start with the primer if Go is new to you; you can open any exercise at any time.

## Adding your own exercises

Each exercise is a folder `exercises/<track>/<id>/`:

- `exercise.json`: title, summary, concepts, minutes, and at least 3 hints
- `prompt.md`: the text shown on the left (use ` ```go ` fences for highlighted code)
- `starter.go`: `package main`, stubs that compile but fail the tests, and a scratch `func main()`
- `solution_test.go`: ordinary Go tests in `package main` (`func TestXxx(t *testing.T)`), using the helpers below
- `reference/<id>/solution.go`: your own answer

`include/dojo_test.go` is copied next to every build and provides `Equal(t, got, want)`, `True`, `False` and `Near`, each with optional trailing context (`Equal(t, got, want, "seed %d", seed)`). `Equal` compares deeply, treats a nil slice or map as equal to an empty one, and requires both values to have the same type (so write `int64(7)`, not `7`, when the function returns an `int64`). Name test helpers with a distinctive prefix (this repo uses `chk...`) so they cannot clash with a learner's own function names.

Test names are shown in the results list in plain words: `TestBFSOnAPath` becomes "bfs on a path".

Run `npm run verify` to check that every starter *fails* and every reference *passes*, with the module language version pinned to Go 1.22; pass id prefixes to check just some (`node scripts/verify.js g0 m01`).

## Limits worth knowing

- The "terminal" streams your program's output and lets you type input, but it is **not a real pseudo-terminal**: no shell, no full-screen programs, line editing is handled in the browser.
- The server listens on `127.0.0.1` only and rejects foreign `Host`/`Origin` headers. It builds and runs code you write, with time and output limits (8 seconds per test, 60 seconds for Run), but **without a sandbox**: only run code you wrote yourself.
- Reference solutions are plain files in `reference/`. The app gates them, your own discipline guards the folder.
- The race detector slows programs down several times; tests are sized so the reference solutions finish well inside the limit even with it on.
- The UI was tested in headless Chromium and the exercises were verified with Go 1.27 on macOS (arm64). Expect small rough edges on your machine.
