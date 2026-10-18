# Union-Find (disjoint sets)

## Concept

**Union-Find** (a.k.a. disjoint set union, DSU) keeps track of a collection of groups and answers two questions very fast:

- `Find(x)`: which group is `x` in? (returns a representative "root")
- `Unite(a, b)`: merge the groups of `a` and `b`.

Each group is a tree stored in a `parent` slice; the root points to itself. Two tricks make the trees almost flat:

- **Path compression**: during `Find`, re-point every visited node directly at the root.
- **Union by size**: always hang the smaller tree under the larger one.

With both, each operation costs the inverse Ackermann function, i.e. effectively constant.

Where it shines: you receive edges one at a time and need to know whether two vertices are already connected, without re-running BFS. **Kruskal's algorithm** for a *minimum spanning tree* (the cheapest set of edges that connects every vertex) is exactly that: take edges from cheapest to most expensive, and keep an edge only if its endpoints are still in different groups.

In Go the "class" is a struct with methods. Methods that change the struct need a **pointer receiver**, `func (d *DSU) Unite(...)`, and the constructor conventionally returns a pointer: `func NewDSU(n int) *DSU`.

## Your task

In `solution.go` implement the type `DSU` for elements `0..n-1`:

- `NewDSU(n int) *DSU`: every element starts alone.
- `(*DSU).Find(x int) int`: the root of `x`'s group. Equal roots mean "same group".
- `(*DSU).Unite(a, b int) bool`: merge; return `true` if they were in different groups, `false` if already together.
- `(*DSU).SizeOf(x int) int`: how many elements are in `x`'s group.
- `(*DSU).Components() int`: the current number of groups.

Then implement `MSTWeight(n int, edges []WeightedEdge) int64`, the total weight of a minimum spanning tree of an undirected weighted graph with vertices `0..n-1`, or `-1` if the graph is not connected. (`WeightedEdge` is provided.)
