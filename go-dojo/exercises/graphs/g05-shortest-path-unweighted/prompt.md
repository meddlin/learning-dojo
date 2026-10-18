# Shortest paths without weights

## Concept

When every edge costs the same, BFS finds **shortest paths** for free. The ring-by-ring order means the first time BFS reaches a vertex is along a path with the fewest possible edges.

Two small additions turn "visit everything" into "how far, and how do I get there":

- **Distance slice**: `dist[v] = dist[u] + 1` when `v` is first discovered from `u`. Initialising to `-1` also tells you whether a vertex was visited.
- **Parent slice**: `parent[v] = u` records *who discovered v*. Following parents from any vertex back to the start spells out a shortest path, in reverse.

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

Go gives you no "fill with -1" constructor, so you write a small loop (`for i := range dist { dist[i] = -1 }`). It is the Go way: a plain loop is fine.

## Your task

Implement two functions in `solution.go`:

1. `BFSDist(g Graph, start int) []int` returns a slice the same length as `g`: `dist[v]` is the fewest edges from `start` to `v`, or `-1` if `v` is unreachable.
2. `ShortestPath(g Graph, start, target int) []int` returns one shortest path as a list of vertices from `start` to `target` **inclusive**. If `target` is unreachable return nil (or an empty slice). If `start == target` return `[]int{start}`.

When several shortest paths exist any of them is accepted.
