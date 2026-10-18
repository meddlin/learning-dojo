package main

import "fmt"

// Cell is a position in the maze.
type Cell struct{ R, C int }

// Neighbors returns the walkable, in-bounds cells next to (r, c) in the order
// up, right, down, left. Walls ('#') and cells off the grid are excluded.
func Neighbors(grid []string, r, c int) []Cell {
	return nil // TODO
}

// MazeSteps returns the fewest moves from 'S' to 'E', or -1 if there is no route
// (or the grid has no S or no E).
func MazeSteps(grid []string) int {
	return -1 // TODO
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
