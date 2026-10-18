package main

import "fmt"

type Graph [][]int

func CountComponents(g Graph) int {
	visited := make([]bool, len(g))
	components := 0
	for s := range g {
		if visited[s] {
			continue
		}
		components++
		visited[s] = true
		queue := []int{s}
		for len(queue) > 0 {
			u := queue[0]
			queue = queue[1:]
			for _, v := range g[u] {
				if !visited[v] {
					visited[v] = true
					queue = append(queue, v)
				}
			}
		}
	}
	return components
}

type cell struct{ r, c int }

// islands returns the size of every island in the grid.
func islands(grid []string) []int {
	visited := make([][]bool, len(grid))
	for r := range grid {
		visited[r] = make([]bool, len(grid[r]))
	}
	dirs := []cell{{-1, 0}, {0, 1}, {1, 0}, {0, -1}}
	var sizes []int
	for r := range grid {
		for c := range len(grid[r]) {
			if grid[r][c] != '1' || visited[r][c] {
				continue
			}
			size := 0
			visited[r][c] = true
			queue := []cell{{r, c}}
			for len(queue) > 0 {
				cur := queue[0]
				queue = queue[1:]
				size++
				for _, d := range dirs {
					nr, nc := cur.r+d.r, cur.c+d.c
					if nr < 0 || nr >= len(grid) || nc < 0 || nc >= len(grid[nr]) {
						continue
					}
					if grid[nr][nc] == '1' && !visited[nr][nc] {
						visited[nr][nc] = true
						queue = append(queue, cell{nr, nc})
					}
				}
			}
			sizes = append(sizes, size)
		}
	}
	return sizes
}

func NumIslands(grid []string) int {
	return len(islands(grid))
}

func LargestIsland(grid []string) int {
	best := 0
	for _, s := range islands(grid) {
		best = max(best, s)
	}
	return best
}

func main() {
	grid := []string{"11000", "11000", "00100", "00011"}
	fmt.Println(NumIslands(grid), LargestIsland(grid))
}
