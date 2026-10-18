# Changelog

## 0.1.0

First release as a VS Code extension, converted from the standalone browser app.

- 74 exercises in two languages: 32 in C/C++ and 42 in Go. Both have foundations, graph traversal and matrix transforms; Go adds a syntax primer.
- Switch between C++ and Go from the status bar, the Path view or the command palette. Each language keeps its own progress, review schedule, tutor chats and place in the path.
- Exercise panel, Path tree view, Test Explorer integration, compiler diagnostics in the editor.
- Real toolchains: clang++/g++ with sanitizers for C++, the `go` tool with the race detector for Go. A panic or hang in one Go test no longer hides the others.
- Spaced review (1, 3, 7, 21, 60 days) and progress stored in the dojo folder.
- Local tutor through Ollama with three teaching styles, tuned to the language being learned.
- Practice mode to switch off autocomplete and AI suggestions.
