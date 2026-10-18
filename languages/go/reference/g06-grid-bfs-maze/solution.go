package main

import "fmt"

type Cell struct{ R, C int }

var dr = [4]int{-1, 0, 1, 0}
var dc = [4]int{0, 1, 0, -1}

func Neighbors(grid []string, r, c int) []Cell {
	var out []Cell
	for k := range 4 {
		nr, nc := r+dr[k], c+dc[k]
		if nr < 0 || nr >= len(grid) || nc < 0 || nc >= len(grid[nr]) {
			continue
		}
		if grid[nr][nc] != '#' {
			out = append(out, Cell{nr, nc})
		}
	}
	return out
}

func MazeSteps(grid []string) int {
	var start, exit *Cell
	for r, row := range grid {
		for c := range len(row) {
			switch row[c] {
			case 'S':
				start = &Cell{r, c}
			case 'E':
				exit = &Cell{r, c}
			}
		}
	}
	if start == nil || exit == nil {
		return -1
	}
	dist := make([][]int, len(grid))
	for r := range dist {
		dist[r] = make([]int, len(grid[r]))
		for c := range dist[r] {
			dist[r][c] = -1
		}
	}
	dist[start.R][start.C] = 0
	queue := []Cell{*start}
	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]
		if cur == *exit {
			return dist[cur.R][cur.C]
		}
		for _, next := range Neighbors(grid, cur.R, cur.C) {
			if dist[next.R][next.C] == -1 {
				dist[next.R][next.C] = dist[cur.R][cur.C] + 1
				queue = append(queue, next)
			}
		}
	}
	return -1
}

func main() {
	maze := []string{
		"S.#.",
		"..#E",
		"....",
	}
	fmt.Println(Neighbors(maze, 1, 1))
	fmt.Println(MazeSteps(maze))
}
