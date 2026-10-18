# Shortest paths without weights

## Concept

When every edge costs the same, BFS finds **shortest paths** for free. The ring-by-ring order means the first time BFS reaches a vertex is along a path with the fewest possible edges.

Two small additions turn "visit everything" into "how far, and how do I get there":

- **Distance array**: `dist[v] = dist[u] + 1` when `v` is first discovered from `u`. Initialising to `-1` also tells you whether a vertex was visited.
- **Parent array**: `parent[v] = u` records *who discovered v*. Following parents from any vertex back to the start spells out a shortest path, in reverse.

```
dist[start] = 0
queue = [start]
while queue not empty:
    u = pop
    for v in g[u]:
        if dist[v] == -1:
            dist[v] = dist[u] + 1
            parent[v] = u
            push v
```

## Your task

Implement two functions in `solution.cpp`:

1. `std::vector<int> bfs_dist(const Graph& g, int start)` returns a vector the same size as `g`: `dist[v]` is the fewest edges from `start` to `v`, or `-1` if `v` is unreachable.
2. `std::vector<int> shortest_path(const Graph& g, int start, int target)` returns one shortest path as a list of vertices from `start` to `target` **inclusive**. If `target` is unreachable return an empty vector. If `start == target` return `{start}`.

When several shortest paths exist any of them is accepted.
