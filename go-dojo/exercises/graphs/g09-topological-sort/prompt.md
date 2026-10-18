# Topological sort

## Concept

Some graphs are **dependencies**: an edge `u -> v` means "u must happen before v" (put on socks before shoes, compile a library before the program using it). A **topological order** lists every vertex so that all edges point forward. One exists exactly when the graph has no directed cycle (it is a **DAG**).

**Kahn's algorithm** builds the order by repeatedly taking something with no remaining prerequisites:

```
indeg[v] = number of edges into v
queue = all v with indeg[v] == 0
while queue not empty:
    u = pop; output u
    for v in g[u]:
        indeg[v]--
        if indeg[v] == 0: push v
```

If you output fewer than `n` vertices, the leftover ones sit on (or behind) a cycle, so no valid order exists. That makes cycle detection a free by-product.

Many orders can be valid; the tests accept any of them.

## Your task

In `solution.go` implement:

1. `TopoOrder(g Graph) []int`: a topological order of all vertices of the directed graph, or **nil** if the graph has a cycle. (An empty graph also gives nil.)
2. `CanFinish(numCourses int, prereqs [][2]int) bool`: courses are `0..numCourses-1`; a pair `{a, b}` means "to take course `a` you must first take `b`". Return true if all courses can be completed.
