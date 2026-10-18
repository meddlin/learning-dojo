package main

import "fmt"

// MinutesToRot returns how many minutes until no fresh orange (1) remains, when
// every minute fresh oranges next to a rotten one (2) rot. 0 if there were no
// fresh oranges; -1 if some can never rot. Do not modify grid.
func MinutesToRot(grid [][]int) int {
	return -2 // TODO
}

// DistanceToNearestZero returns, for each cell of a 0/1 matrix (with at least one
// 0), the number of 4-directional steps to the nearest 0. Do not modify mat.
func DistanceToNearestZero(mat [][]int) [][]int {
	return nil // TODO
}

func main() {
	fmt.Println(MinutesToRot([][]int{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}))
	fmt.Println(DistanceToNearestZero([][]int{{0, 0, 0}, {0, 1, 0}, {1, 1, 1}}))
}
