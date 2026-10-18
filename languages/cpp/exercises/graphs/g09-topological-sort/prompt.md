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

In `solution.cpp` implement:

1. `std::vector<int> topo_order(const Graph& g)`: a topological order of all vertices of the directed graph, or an **empty vector** if the graph has a cycle. (An empty graph also gives an empty vector.)
2. `bool can_finish(int num_courses, const std::vector<std::pair<int,int>>& prereqs)`: courses are `0..num_courses-1`; a pair `{a, b}` means "to take course `a` you must first take `b`". Return true if all courses can be completed.
