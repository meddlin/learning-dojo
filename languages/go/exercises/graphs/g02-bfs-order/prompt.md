# Breadth-first search

## Concept

**Breadth-first search (BFS)** explores a graph in rings: first the start vertex, then everything one edge away, then everything two edges away, and so on. It uses a **queue** (first in, first out) of vertices waiting to be explored, and a **visited** array so nothing is processed twice.

```
queue = [start]; visited[start] = true
while queue is not empty:
    u = pop front
    for each neighbour v of u:
        if not visited[v]: visited[v] = true; push v
```

Running time is O(V + E): every vertex enters the queue at most once and every edge is looked at once (or twice if undirected).

Why a queue gives "level by level": vertices pushed earlier are nearer to the start, and a FIFO queue serves them first.

Go has no built-in queue type, and you do not need one. A slice does the job: **push** with `queue = append(queue, v)`, **pop** with `u := queue[0]; queue = queue[1:]`. Re-slicing does not copy anything, it just moves the start of the window, so both operations are cheap.

## Your task

Implement `BFSOrder(g Graph, start int) []int` in `solution.go`: the vertices in the order BFS reaches them from `start`, trying each vertex's neighbours **in the order they are stored** in `g[u]`. Only vertices reachable from `start` appear, each exactly once.

For example, with `g = Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}` (a square) and `start = 0`, the answer is `[0 1 2 3]`.
