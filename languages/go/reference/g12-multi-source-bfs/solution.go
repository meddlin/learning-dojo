package main

import "fmt"

type cell struct{ r, c int }

var dirs = []cell{{-1, 0}, {0, 1}, {1, 0}, {0, -1}}

func filled(rows, cols, v int) [][]int {
	out := make([][]int, rows)
	for r := range out {
		out[r] = make([]int, cols)
		for c := range out[r] {
			out[r][c] = v
		}
	}
	return out
}

func MinutesToRot(grid [][]int) int {
	if len(grid) == 0 {
		return 0
	}
	minute := filled(len(grid), len(grid[0]), -1)
	rotted := make([][]bool, len(grid))
	var queue []cell
	fresh := 0
	for r := range grid {
		rotted[r] = make([]bool, len(grid[r]))
		for c, v := range grid[r] {
			switch v {
			case 1:
				fresh++
			case 2:
				rotted[r][c] = true
				minute[r][c] = 0
				queue = append(queue, cell{r, c})
			}
		}
	}
	last := 0
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		for _, d := range dirs {
			nr, nc := cur.r+d.r, cur.c+d.c
			if nr < 0 || nr >= len(grid) || nc < 0 || nc >= len(grid[nr]) {
				continue
			}
			if grid[nr][nc] == 1 && !rotted[nr][nc] {
				rotted[nr][nc] = true
				minute[nr][nc] = minute[cur.r][cur.c] + 1
				last = minute[nr][nc]
				fresh--
				queue = append(queue, cell{nr, nc})
			}
		}
	}
	if fresh > 0 {
		return -1
	}
	return last
}

func DistanceToNearestZero(mat [][]int) [][]int {
	if len(mat) == 0 {
		return nil
	}
	dist := filled(len(mat), len(mat[0]), -1)
	var queue []cell
	for r := range mat {
		for c, v := range mat[r] {
			if v == 0 {
				dist[r][c] = 0
				queue = append(queue, cell{r, c})
			}
		}
	}
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		for _, d := range dirs {
			nr, nc := cur.r+d.r, cur.c+d.c
			if nr < 0 || nr >= len(mat) || nc < 0 || nc >= len(mat[nr]) {
				continue
			}
			if dist[nr][nc] == -1 {
				dist[nr][nc] = dist[cur.r][cur.c] + 1
				queue = append(queue, cell{nr, nc})
			}
		}
	}
	return dist
}

func main() {
	fmt.Println(MinutesToRot([][]int{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}))
	fmt.Println(DistanceToNearestZero([][]int{{0, 0, 0}, {0, 1, 0}, {1, 1, 1}}))
}
