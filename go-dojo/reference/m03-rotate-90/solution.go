package main

import (
	"fmt"
	"slices"
)

type Matrix [][]int

func newMatrix(rows, cols int) Matrix {
	m := make(Matrix, rows)
	for r := range m {
		m[r] = make([]int, cols)
	}
	return m
}

func RotateCW(m Matrix) Matrix {
	if len(m) == 0 {
		return nil
	}
	R, C := len(m), len(m[0])
	out := newMatrix(C, R)
	for r := range R {
		for c := range C {
			out[c][R-1-r] = m[r][c]
		}
	}
	return out
}

func RotateCCW(m Matrix) Matrix {
	if len(m) == 0 {
		return nil
	}
	R, C := len(m), len(m[0])
	out := newMatrix(C, R)
	for r := range R {
		for c := range C {
			out[C-1-c][r] = m[r][c]
		}
	}
	return out
}

func Rotate180(m Matrix) Matrix {
	if len(m) == 0 {
		return nil
	}
	R, C := len(m), len(m[0])
	out := newMatrix(R, C)
	for r := range R {
		for c := range C {
			out[R-1-r][C-1-c] = m[r][c]
		}
	}
	return out
}

func RotateInPlace(m Matrix) {
	n := len(m)
	for r := range n {
		for c := r + 1; c < n; c++ {
			m[r][c], m[c][r] = m[c][r], m[r][c]
		}
	}
	for _, row := range m {
		slices.Reverse(row)
	}
}

func main() {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	fmt.Println(RotateCW(m))
}
