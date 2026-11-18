# Changelog

## Unreleased

- **Python**: a third language with 30 exercises in four tracks: Python Basics (7), Data Structures (7), Files & CSV (6) and pandas (10).
- Python tests run through a small bundled runner (no pytest needed): each test runs on its own, a crash or hang fails only that test, syntax and import errors are underlined in `solution.py`, and a missing pandas install comes with set-up instructions.
- *Run* starts `python solution.py` in a terminal.
- New setting `dojo.python.path`. Without it, an interpreter with pandas is preferred, and `~/.dojo-venv` is found automatically.
- Python syntax highlighting in the exercise panel and the tutor.

## 0.1.0

First release as a VS Code extension, converted from the standalone browser app.

- 74 exercises in two languages: 32 in C/C++ and 42 in Go. Both have foundations, graph traversal and matrix transforms; Go adds a syntax primer.
- Switch between C++ and Go from the status bar, the Path view or the command palette. Each language keeps its own progress, review schedule, tutor chats and place in the path.
- Exercise panel, Path tree view, Test Explorer integration, compiler diagnostics in the editor.
- Real toolchains: clang++/g++ with sanitizers for C++, the `go` tool with the race detector for Go. A panic or hang in one Go test no longer hides the others.
- Spaced review (1, 3, 7, 21, 60 days) and progress stored in the dojo folder.
- Local tutor through Ollama with three teaching styles, tuned to the language being learned.
- Practice mode to switch off autocomplete and AI suggestions.
