# Union-Find (disjoint sets)

## Concept

**Union-Find** (a.k.a. disjoint set union, DSU) keeps track of a collection of groups and answers two questions very fast:

- `find(x)`: which group is `x` in? (returns a representative "root")
- `unite(a, b)`: merge the groups of `a` and `b`.

Each group is a tree stored in a `parent` array; the root points to itself. Two tricks make the trees almost flat:

- **Path compression**: during `find`, re-point every visited node directly at the root.
- **Union by size**: always hang the smaller tree under the larger one.

With both, each operation costs the inverse Ackermann function, i.e. effectively constant.

Where it shines: you receive edges one at a time and need to know whether two vertices are already connected, without re-running BFS. **Kruskal's algorithm** for a *minimum spanning tree* (the cheapest set of edges that connects every vertex) is exactly that: take edges from cheapest to most expensive, and keep an edge only if its endpoints are still in different groups.

## Your task

In `solution.cpp` implement the class `DSU` for elements `0..n-1`:

- `DSU(int n)`: every element starts alone.
- `int find(int x)`: the root of `x`'s group. Equal roots mean "same group".
- `bool unite(int a, int b)`: merge; return `true` if they were in different groups, `false` if already together.
- `int size_of(int x)`: how many elements are in `x`'s group.
- `int components() const`: the current number of groups.

Then implement `long long mst_weight(int n, std::vector<Edge> edges)`, the total weight of a minimum spanning tree of an undirected weighted graph with vertices `0..n-1`, or `-1` if the graph is not connected. (`Edge` is provided.)
