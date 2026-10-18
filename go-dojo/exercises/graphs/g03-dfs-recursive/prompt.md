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

**Sharing state in Go.** The visit function needs the same `visited` and `order` on every call. Two idiomatic ways:

```go
// 1. A closure: it captures the variables around it.
func DFSOrder(g Graph, start int) []int {
	visited := make([]bool, len(g))
	var order []int
	var visit func(u int) // declared first so the body can call itself
	visit = func(u int) {
		// ... uses visited and order directly
	}
	visit(start)
	return order
}

// 2. A helper that takes what it needs. Slices are passed by value (a small
//    header), so a helper that appends must receive *[]int to grow the caller's slice.
func visitFrom(g Graph, u int, visited []bool, order *[]int) { /* ... */ }
```

A note on depth: Go goroutine stacks start tiny and **grow on demand** (up to 1 GB by default), so deep recursion is far less dangerous than in C or C++. The next exercise shows why an explicit stack is still worth knowing.

## Your task

Implement in `solution.go`:

1. `DFSOrder(g Graph, start int) []int`: vertices in depth-first **pre-order** from `start`, trying neighbours in the order stored in `g[u]`.
2. `Reachable(g Graph, from, to int) bool`: can you get from `from` to `to` by following edges? (A vertex reaches itself.)

With `g = Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}`, `DFSOrder(g, 0)` is `[0 1 3 4 2 5]`: it dives down `0 -> 1 -> 3`, backs up to try `4`, then returns to `0` for `2` and `5`.
