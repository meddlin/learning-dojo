package main

import "fmt"

// Mat is a matrix of int64: m[row][col].
type Mat [][]int64

// Identity returns the n x n identity matrix.
func Identity(n int) Mat {
	return nil // TODO
}

// Multiply returns a * b. a's column count equals b's row count; neither is empty.
func Multiply(a, b Mat) Mat {
	return nil // TODO
}

// MatPow returns m^exp for a square m and exp >= 0, using O(log exp) multiplications.
// MatPow(m, 0) is the identity.
func MatPow(m Mat, exp int64) Mat {
	return nil // TODO
}

// Fibonacci returns F(n) for 0 <= n <= 90, computed with MatPow.
func Fibonacci(n int) int64 {
	return -1 // TODO
}

func main() {
	a := Mat{{1, 2}, {3, 4}}
	b := Mat{{5, 6}, {7, 8}}
	fmt.Println(Multiply(a, b))
	fmt.Println(Fibonacci(10))
}
