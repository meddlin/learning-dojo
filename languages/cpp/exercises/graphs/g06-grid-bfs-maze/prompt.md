# BFS on a grid: solving a maze

## Concept

Many graph problems never hand you a graph. A **grid** is one in disguise: each cell is a vertex, and its neighbours (up, down, left, right) are its edges. You do not build an adjacency list; you compute neighbours on demand. This is called an **implicit graph**.

The only new skill is **bounds checking**: stepping off the grid must not index outside the vector. Check `0 <= r < rows` and `0 <= c < cols` *before* touching `grid[r][c]`. A direction table keeps the code short:

```cpp
const int dr[4] = {-1, 0, 1, 0};   // up, right, down, left
const int dc[4] = {0, 1, 0, -1};
for (int k = 0; k < 4; ++k) {
    int nr = r + dr[k], nc = c + dc[k];
    ...
}
```

Everything else is the BFS you already wrote. Because every move costs one step, BFS gives the shortest route.

## Your task

The maze is a `std::vector<std::string>`. `'#'` is a wall, `'.'` is open floor, `'S'` is the start and `'E'` is the exit (both are walkable).

1. `std::vector<std::pair<int,int>> neighbors(const std::vector<std::string>& grid, int r, int c)` returns the walkable in-bounds cells next to `(r, c)`, in the order **up, right, down, left**. Walls and off-grid cells are excluded.
2. `int maze_steps(const std::vector<std::string>& grid)` returns the fewest moves from `S` to `E`, or `-1` if there is no route (or no `S`/`E`).
