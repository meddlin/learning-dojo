# Multi-source BFS

## Concept

What if the question is "how far is each cell from the *nearest* of several places"? Running one BFS per source would be slow. Instead **seed the queue with every source at once**, all at distance 0. The wavefront then expands from all of them in lockstep, and the first time it reaches a cell is along the shortest route from the nearest source. One BFS, O(rows x cols).

```
queue = all sources; dist[source] = 0
while queue not empty:
    u = pop
    for neighbour v of u that has no distance yet:
        dist[v] = dist[u] + 1; push v
```

It is a clever trick of viewpoint: imagine a virtual super-source connected to every real source by zero-length edges.

## Your task

Implement in `solution.cpp`:

1. `int minutes_to_rot(std::vector<std::vector<int>> grid)`: cells are `0` (empty), `1` (fresh orange) or `2` (rotten orange). Each minute every fresh orange that is 4-directionally adjacent to a rotten one becomes rotten. Return the number of minutes until no fresh orange remains, `0` if there were none to begin with, or `-1` if some fresh orange can never rot.
2. `std::vector<std::vector<int>> distance_to_nearest_zero(const std::vector<std::vector<int>>& mat)`: a matrix of `0`s and `1`s (with at least one `0`). Return, for each cell, the number of 4-directional steps to the nearest `0`.
