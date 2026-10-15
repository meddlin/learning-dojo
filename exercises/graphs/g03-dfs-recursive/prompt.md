# Depth-first search (recursive)

## Concept

**Depth-first search (DFS)** follows one path as far as it can, and only when it hits a dead end (every neighbour already visited) does it **backtrack** and try the next option. It is naturally recursive: "visit me, then fully explore each unvisited neighbour in turn."

```
visit(u):
    mark u visited; record u         <- pre-order: record on the way in
    for each neighbour v of u:
        if v is not visited: visit(v)
```

The call stack remembers where to backtrack to. Like BFS it runs in O(V + E).

DFS is the tool behind many classic algorithms: finding connected components, detecting cycles, topological sorting, solving mazes.

A warning for later: each recursive call uses stack space, so a graph shaped like a very long path can overflow the stack (tens of thousands of levels deep). The next exercise removes the recursion.

## Your task

Implement in `solution.cpp`:

1. `void dfs_visit(const Graph& g, int u, std::vector<bool>& visited, std::vector<int>& order)`: the recursive helper described above.
2. `std::vector<int> dfs_order(const Graph& g, int start)`: vertices in depth-first **pre-order** from `start`, trying neighbours in the order stored in `g[u]`.
3. `bool reachable(const Graph& g, int from, int to)`: can you get from `from` to `to` by following edges? (A vertex reaches itself.)

With `g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}`, `dfs_order(g, 0)` is `{0, 1, 3, 4, 2, 5}`: it dives down `0 -> 1 -> 3`, backs up to try `4`, then returns to `0` for `2` and `5`.
