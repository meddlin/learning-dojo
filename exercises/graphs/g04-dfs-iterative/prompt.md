# Depth-first search (iterative)

## Concept

Recursion is just a hidden stack: the call stack. You can run DFS with an explicit `std::stack` instead, which is worth knowing for two reasons:

- A heap-allocated stack can grow to millions of entries, while the call stack overflows after tens of thousands of nested calls. The tests include a path 200,000 vertices long.
- It makes the algorithm's state explicit, which helps when you need to pause it, or when a language limits recursion depth.

The loop looks like this:

```
stack = [start]
while stack is not empty:
    u = pop
    if u is visited: skip it
    mark u visited; record u
    push the neighbours of u
```

Compare it with BFS: the *only* structural difference is that the container is a stack instead of a queue. That single change turns "level by level" into "as deep as possible first".

The subtle part is order. If you push `g[u]` front to back, the stack pops the *last* neighbour first, and you get a valid depth-first order but a different one from the recursive version. To reproduce the recursive order exactly you must push the neighbours **in reverse**.

## Your task

Implement `std::vector<int> dfs_order_iterative(const Graph& g, int start)` in `solution.cpp`. It must return **exactly the same order** as the recursive pre-order DFS from the previous exercise: neighbours are tried in the order stored in `g[u]`.

The tests compare against a recursive implementation on hand-built and random graphs, and also run a path so long that recursion would crash.
