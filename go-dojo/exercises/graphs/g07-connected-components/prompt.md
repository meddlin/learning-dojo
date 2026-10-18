# Connected components and islands

## Concept

A **connected component** is a maximal set of vertices that can all reach each other. A graph in one piece has one component; a graph with isolated clusters has several.

To count them you need only one extra idea on top of BFS/DFS: an **outer loop**.

```
components = 0
for each vertex s:
    if not visited[s]:
        components++
        flood(s)          // BFS or DFS marks the whole component
```

The same pattern solves the classic "number of islands" puzzle. A grid of `'1'` (land) and `'0'` (water) is a graph where land cells touch their up/down/left/right land neighbours; each island is a connected component. Flood-filling an island also tells you its **size** if you count the cells as you mark them.

The total work is still O(V + E): the outer loop is O(V) and each vertex/edge is touched by exactly one flood.

A Go note: a `[]string` is a slice of immutable strings, and a slice you receive shares its memory with the caller. Marking visited land by editing the grid would both be impossible (strings cannot be changed in place) and rude (replacing `grid[r]` would change the caller's data). Use a separate `visited` slice. The tests check that your functions leave the input alone.

## Your task

In `solution.go` implement:

1. `CountComponents(g Graph) int`: the number of connected components of an **undirected** graph (edges appear in both endpoints' lists). An empty graph has 0; an isolated vertex counts as one.
2. `NumIslands(grid []string) int`: the number of islands, where cells touch only in the four cardinal directions (no diagonals).
3. `LargestIsland(grid []string) int`: the number of cells in the biggest island, or 0 if there is no land.
