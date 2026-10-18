package main

import "fmt"

type Graph [][]int

// CountComponents returns the number of connected components of an undirected
// graph. An empty graph has 0 components; an isolated vertex is one component.
func CountComponents(g Graph) int {
	return -1 // TODO
}

// NumIslands counts the islands of '1' cells in the grid. Cells touch only up,
// down, left and right (no diagonals). Do not modify grid.
func NumIslands(grid []string) int {
	return -1 // TODO
}

// LargestIsland returns the size of the biggest island, or 0 if there is no land.
func LargestIsland(grid []string) int {
	return -1 // TODO
}

func main() {
	grid := []string{"11000", "11000", "00100", "00011"}
	fmt.Println(NumIslands(grid), LargestIsland(grid))
}
