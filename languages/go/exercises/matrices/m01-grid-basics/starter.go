package main

import "fmt"

// Matrix is a rectangular grid: m[row][col].
type Matrix [][]int

// MakeMatrix returns a rows x cols matrix with every cell equal to fill.
// Each row must be its own slice.
func MakeMatrix(rows, cols, fill int) Matrix {
	return nil // TODO
}

// Transpose swaps rows and columns: an r x c matrix becomes c x r.
// An empty matrix gives an empty matrix.
func Transpose(m Matrix) Matrix {
	return nil // TODO
}

// RowSums returns the sum of each row.
func RowSums(m Matrix) []int {
	return nil // TODO
}

// ColSums returns the sum of each column.
func ColSums(m Matrix) []int {
	return nil // TODO
}

// IsSymmetric reports whether m is square and equal to its own transpose.
// The empty matrix is symmetric.
func IsSymmetric(m Matrix) bool {
	return false // TODO
}

func main() {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	fmt.Println(Transpose(m))
	fmt.Println(RowSums(m), ColSums(m))
}
