# Dijkstra's shortest paths

## Concept

BFS finds fewest-*edges* paths. When edges have **weights** (distances, costs, times), the route with fewest edges is not necessarily the cheapest. **Dijkstra's algorithm** handles non-negative weights.

Idea: maintain the best known distance `dist[v]` to every vertex, and always finalise the *closest* unfinished vertex next. A **priority queue** (min-heap) gives you that vertex in O(log n).

```
dist[*] = INF; dist[start] = 0
pq = {(0, start)}
while pq not empty:
    (d, u) = pop smallest
    if d > dist[u]: continue          // stale entry, skip
    for (v, w) in edges of u:
        if dist[u] + w < dist[v]:     // "relax" the edge
            dist[v] = dist[u] + w
            push (dist[v], v)
```

A vertex may be pushed several times with different distances; only the smallest is ever up to date, hence the `d > dist[u]` check ("lazy deletion"). With a binary heap the total cost is O((V + E) log V).

It fails with negative weights: a later, cheaper detour could invalidate an already-finalised vertex.

## Your task

The weighted graph is `WGraph`, a `[][]Arc`: `g[u]` holds `Arc{To, W}` values, meaning an edge `u -> To` with weight `W >= 0`. `INF` (provided) marks "unreachable".

1. `Dijkstra(g WGraph, start int) []int64`: the shortest distance from `start` to every vertex, `INF` if unreachable.
2. `DijkstraPath(g WGraph, start, target int) []int`: one cheapest path from `start` to `target` inclusive, or nil if unreachable.
