package main

import "fmt"

type Matrix [][]int

// SpiralOrder returns every cell of m in clockwise spiral order from the top-left.
// Works for any rectangle (including one row or one column) and for the empty matrix.
func SpiralOrder(m Matrix) []int {
	return nil // TODO
}

// SpiralMatrix returns the n x n matrix filled with 1..n*n along a clockwise
// spiral from the top-left. n == 0 gives an empty matrix.
func SpiralMatrix(n int) Matrix {
	return nil // TODO
}

func main() {
	fmt.Println(SpiralOrder(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}))
	fmt.Println(SpiralMatrix(3))
}
