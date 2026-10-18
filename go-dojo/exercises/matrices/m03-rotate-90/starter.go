package main

import "fmt"

type Matrix [][]int

// RotateCW returns a new matrix rotated 90 degrees clockwise.
// Works for any rectangle; an empty input gives an empty result. Do not modify m.
func RotateCW(m Matrix) Matrix {
	return nil // TODO
}

// RotateCCW returns a new matrix rotated 90 degrees counter-clockwise.
func RotateCCW(m Matrix) Matrix {
	return nil // TODO
}

// Rotate180 returns a new matrix rotated 180 degrees.
func Rotate180(m Matrix) Matrix {
	return nil // TODO
}

// RotateInPlace rotates the square n x n matrix m clockwise, without allocating
// another matrix: swaps and reversing only.
func RotateInPlace(m Matrix) {
	// TODO
}

func main() {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	fmt.Println(RotateCW(m))
}
