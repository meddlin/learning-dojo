# Cycle detection

## Concept

A **cycle** is a path that starts and ends at the same vertex. Detecting one is a classic DFS application, but the rule differs between undirected and directed graphs.

**Undirected.** Every edge `u - v` is stored as `u -> v` *and* `v -> u`, so DFS naturally sees the edge back to the vertex it just came from. That is not a cycle. Track the `parent` and report a cycle when you reach an already-visited neighbour that is **not** the parent.

**Directed.** Reaching an already-visited vertex does not prove a cycle: in `A->B, A->C, C->B`, vertex `B` is reached twice but there is no way back to `A`. What matters is whether the visited vertex is *still on the current DFS path*. Use three states:

| state | meaning |
|-------|---------|
| 0 white | not seen yet |
| 1 grey | on the recursion stack right now |
| 2 black | completely explored |

Touching a **grey** vertex means you found an edge pointing back into your own path (a *back edge*), which is exactly a cycle.

Both run in O(V + E).

## Your task

Implement in `solution.cpp`:

1. `bool has_cycle_undirected(const Graph& g)` for a *simple* undirected graph (no self-loops, no repeated edges; each edge listed in both directions).
2. `bool has_cycle_directed(const Graph& g)` for a directed graph. Self-loops (`u -> u`) count as cycles.

Graphs may be disconnected, so start a traversal from every unvisited vertex.
