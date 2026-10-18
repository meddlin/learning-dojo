# Representing a graph

## Concept

A graph is a set of **vertices** (nodes) joined by **edges**. Edges can be **directed** (`u -> v`: you can go from `u` to `v` but not necessarily back) or **undirected** (a two-way link).

The usual way to store a graph in code is an **adjacency list**: for every vertex, a list of its neighbours.

```go
type Graph [][]int // g[u] = neighbours of u

// Edges 0-1, 0-2, 2-3 (undirected):
// g[0] = {1, 2}   g[1] = {0}   g[2] = {0, 3}   g[3] = {2}
```

Vertices are numbered `0..n-1`, so a vertex *is* an index. The list takes O(V + E) memory and lets you visit all neighbours of `u` in time proportional to their number, which is what traversals need. (The alternative, an adjacency **matrix** `[][]bool`, uses O(V²) memory but answers "is there an edge u -> v?" in O(1).)

An undirected edge is stored twice, once in each direction. Every algorithm in this track takes a `Graph` like this one.

A Go detail that makes this pleasant: `make(Graph, n)` gives you `n` **nil** slices, and a nil slice is a valid empty slice. `append` on it allocates as needed, so you never have to "initialise" each list.

## Your task

Implement in `solution.go`:

1. `BuildGraph(n int, edges []Edge, directed bool) Graph`: `n` vertices, and for each edge `{U, V}` add `V` to `g[U]`; if not `directed`, also add `U` to `g[V]`. Neighbours stay in the order the edges were given. Inputs contain no self-loops.
2. `OutDegree(g Graph, u int) int`: how many edges leave `u`.
3. `InDegrees(g Graph) []int`: for every vertex, how many edges enter it.
4. `HasEdge(g Graph, u, v int) bool`: is there an edge `u -> v`?
