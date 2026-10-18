# BFS on a grid: solving a maze

## Concept

Many graph problems never hand you a graph. A **grid** is one in disguise: each cell is a vertex, and its neighbours (up, down, left, right) are its edges. You do not build an adjacency list; you compute neighbours on demand. This is called an **implicit graph**.

The only new skill is **bounds checking**: stepping off the grid must not index outside the slice. Go checks every index at run time and **panics** if it is out of range, which is safer than C but still a crash. Check `0 <= r < rows` and `0 <= c < cols` *before* touching `grid[r][c]`. A direction table keeps the code short:

```go
var dr = [4]int{-1, 0, 1, 0} // up, right, down, left
var dc = [4]int{0, 1, 0, -1}
for k := range 4 {
	nr, nc := r+dr[k], c+dc[k]
	// ...
}
```

Everything else is the BFS you already wrote. Because every move costs one step, BFS gives the shortest route.

## Your task

The maze is a `[]string`, one string per row. `'#'` is a wall, `'.'` is open floor, `'S'` is the start and `'E'` is the exit (both are walkable). `Cell{R, C}` is provided.

1. `Neighbors(grid []string, r, c int) []Cell` returns the walkable in-bounds cells next to `(r, c)`, in the order **up, right, down, left**. Walls and off-grid cells are excluded.
2. `MazeSteps(grid []string) int` returns the fewest moves from `S` to `E`, or `-1` if there is no route (or no `S`/`E`).
