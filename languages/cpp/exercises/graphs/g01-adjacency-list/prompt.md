# Representing a graph

## Concept

A graph is a set of **vertices** (nodes) joined by **edges**. Edges can be **directed** (`u -> v`: you can go from `u` to `v` but not necessarily back) or **undirected** (a two-way link).

The usual way to store a graph in code is an **adjacency list**: for every vertex, a list of its neighbours.

```cpp
using Graph = std::vector<std::vector<int>>;   // g[u] = neighbours of u

// Edges 0-1, 0-2, 2-3 (undirected):
// g[0] = {1, 2}   g[1] = {0}   g[2] = {0, 3}   g[3] = {2}
```

Vertices are numbered `0..n-1`, so a vertex *is* an index. The list takes O(V + E) memory and lets you visit all neighbours of `u` in time proportional to their number, which is what traversals need. (The alternative, an adjacency **matrix** `bool m[V][V]`, uses O(V²) memory but answers "is there an edge u -> v?" in O(1).)

An undirected edge is stored twice, once in each direction. Every algorithm in this track takes a `Graph` like this one.

## Your task

Implement in `solution.cpp`:

1. `Graph build_graph(int n, const std::vector<Edge>& edges, bool directed)`: `n` vertices, and for each edge `(u, v)` add `v` to `g[u]`; if not `directed`, also add `u` to `g[v]`. Neighbours stay in the order the edges were given. Inputs contain no self-loops.
2. `int out_degree(const Graph& g, int u)`: how many edges leave `u`.
3. `std::vector<int> in_degrees(const Graph& g)`: for every vertex, how many edges enter it.
4. `bool has_edge(const Graph& g, int u, int v)`: is there an edge `u -> v`?
