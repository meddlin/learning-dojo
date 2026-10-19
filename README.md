# Learning Dojo

Learn **C/C++** and **Go** by writing the code yourself, inside VS Code. Learning Dojo gives you 74 hands-on exercises (32 in C++, 42 in Go), tests that run on your own toolchain, spaced review so the material sticks, and an optional tutor that runs on a local [Ollama](https://ollama.com) model, so nothing leaves your machine.

Both languages follow the same path: fundamentals (integers, pointers, memory, structs) through **graph traversal** (BFS, DFS, shortest paths, topological sort, union-find, Dijkstra and more) to **matrix transforms** (rotation, spirals, multiplication, homogeneous coordinates, transform pipelines). Go also has a short **syntax primer** first.

## How it works

1. Open the **Dojo** view in the Activity Bar and choose a folder for your work. Use a dedicated folder or the one you already have open. Your code and progress are plain files there, so you can put them in git.
2. **Pick a language** with the `C++` / `Go` item in the status bar, or the button at the top of the Path view (or run *Dojo: Switch Language*). Each language has its own exercises, progress, review schedule and tutor chats, and remembers where you were.
3. Pick an exercise. The statement opens on the left and your `solution.cpp` / `solution.go` on the right.
4. Press **Cmd/Ctrl+Enter** to run the tests. Failures show up in the Test Explorer, compiler errors are underlined in your file and listed in Problems.
5. Stuck? Ask the tutor, or reveal hints one at a time. The reference solution unlocks only after you have tried the tests and used every hint, and looking at it schedules a quick review for the next day.
6. Solved exercises come back for review after 1, 3, 7, 21 and 60 days. You re-solve them from a blank file.

Your folder ends up like this:

```
my-dojo/
  .dojo/progress.json        progress for both languages (build products are git-ignored)
  cpp/foundations/f01-ints-and-overflow/solution.cpp
  go/foundations/f01-ints-and-overflow/solution.go
```

## Features

- **Real toolchains, real tests.** C++ is built with `clang++` or `g++` (C++20, falling back to C++17) with AddressSanitizer and UndefinedBehaviorSanitizer when available. Go is built with your `go` (1.22 or newer) and, where the machine supports it, the race detector. Out-of-bounds access, overflow and data races become readable errors.
- **Test Explorer integration.** Each exercise and each test case is listed under Testing, for the language you are on. In Go, a test that panics or hangs is reported on its own and the rest still run.
- **Run your own `main()`** in a real terminal with **Cmd/Ctrl+Shift+Enter** to experiment with input and output.
- **Practice mode.** One command switches off autocomplete, parameter hints and AI inline suggestions in your dojo folder, so you recall syntax instead of accepting it.
- **Local tutor.** Three styles: *Guide me* (questions and nudges, no solutions), *Explain* (concepts with other examples) and *Show code* (code, then retype it from memory). It knows which language you are learning, and can see your code and the last test output; one checkbox turns that off.
- **Progress tracking** in `.dojo/progress.json`, with a status bar summary and a badge for reviews that are due.

## Requirements

You only need the toolchain for the language you want to use. A language whose toolchain is missing still lists its exercises, and tells you what to install when you try to run one.

- **C++:** `clang++` or `g++`. macOS: `xcode-select --install`. Linux: install `g++` or `clang`. Windows: MSYS2/MinGW-w64 or LLVM clang (MSVC is not supported).
- **Go:** Go 1.22 or newer from <https://go.dev/dl/> (or `brew install go`). Builds run in throw-away modules with `GOTOOLCHAIN=local`, so nothing is downloaded and your own modules are untouched. The extension does not need the Go extension, but installing it gives you gopls and gofmt on save.
- For the tutor only: [Ollama](https://ollama.com) running locally and at least one model, for example `ollama pull qwen2.5-coder:7b`.

The extension runs code you write, so it needs a **trusted workspace** and does not work in virtual workspaces.

## Settings

| Setting | Default | Purpose |
| --- | --- | --- |
| `dojo.compiler` | auto | C++ compiler command or path, for example `g++-14`. |
| `dojo.sanitizers` | `true` | Build C++ tests with ASan and UBSan when supported. |
| `dojo.go.path` | auto | Path to the `go` binary. Falls back to `GO`, `GOROOT`, `PATH` and the usual install folders. |
| `dojo.go.race` | `true` | Build Go with the race detector when the machine can (needs cgo). |
| `dojo.tutor.enabled` | `true` | Show the tutor chat. |
| `dojo.tutor.ollamaUrl` | auto | Ollama server. Falls back to `OLLAMA_URL`, `OLLAMA_HOST`, then `http://127.0.0.1:11434`. |
| `dojo.tutor.model` | first installed | Model for the tutor. |
| `dojo.tutor.mode` | `socratic` | Tutor style. |

## Privacy

Nothing is sent anywhere except to the Ollama server you configure (by default on your own machine). There is no telemetry.

## Development

```bash
npm install
npm run build        # bundles src/ to dist/extension.js
npm test             # core library and extension tests (uses a fake VS Code API)
npm run verify       # builds every exercise: starters must fail, reference solutions must pass
npm run verify -- --lang go g0   # one language, ids starting with g0
```

Press **F5** (the *Run Extension* launch configuration) to start an Extension Development Host.
See [docs/PUBLISHING.md](docs/PUBLISHING.md) for releasing, and [docs/ADDING-EXERCISES.md](docs/ADDING-EXERCISES.md) for authoring new ones.
