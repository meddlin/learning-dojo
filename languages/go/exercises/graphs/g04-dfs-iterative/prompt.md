# Depth-first search (iterative)

## Concept

Recursion is just a hidden stack: the call stack. You can run DFS with an explicit stack instead, which is worth knowing for a few reasons:

- A goroutine's stack grows on demand, but only up to a limit (1 GB by default). Blow through it and the program dies with `fatal error: stack overflow`, which is **not** a panic: you cannot `recover` from it. A path of tens of millions of vertices is enough.
- A heap-allocated stack of `int`s costs 8 bytes per entry. A recursive call frame costs many times that, and growing the call stack means copying it to a bigger block.
- It makes the algorithm's state explicit, which helps when you need to pause it or bound its memory.

The tests include a path 500,000 vertices long.

The loop looks like this:

```
stack = [start]
while stack is not empty:
    u = pop
    if u is visited: skip it
    mark u visited; record u
    push the neighbours of u
```

Compare it with BFS: the *only* structural difference is that you take from the other end of the slice. That single change turns "level by level" into "as deep as possible first". In Go a stack is a slice too: **push** with `append`, **pop** with `stack = stack[:len(stack)-1]`.

The subtle part is order. If you push `g[u]` front to back, the stack pops the *last* neighbour first, and you get a valid depth-first order but a different one from the recursive version. To reproduce the recursive order exactly you must push the neighbours **in reverse**.

## Your task

Implement `DFSOrderIterative(g Graph, start int) []int` in `solution.go`. It must return **exactly the same order** as the recursive pre-order DFS from the previous exercise: neighbours are tried in the order stored in `g[u]`.

The tests compare against a recursive implementation on hand-built and random graphs, and also run a very long path.
