package main

import "fmt"

type Matrix [][]int

func MakeMatrix(rows, cols, fill int) Matrix {
	m := make(Matrix, rows)
	for r := range m {
		m[r] = make([]int, cols)
		for c := range m[r] {
			m[r][c] = fill
		}
	}
	return m
}

func Transpose(m Matrix) Matrix {
	if len(m) == 0 {
		return nil
	}
	rows, cols := len(m), len(m[0])
	t := MakeMatrix(cols, rows, 0)
	for r := range rows {
		for c := range cols {
			t[c][r] = m[r][c]
		}
	}
	return t
}

func RowSums(m Matrix) []int {
	sums := make([]int, len(m))
	for r, row := range m {
		for _, v := range row {
			sums[r] += v
		}
	}
	return sums
}

func ColSums(m Matrix) []int {
	if len(m) == 0 {
		return nil
	}
	sums := make([]int, len(m[0]))
	for _, row := range m {
		for c, v := range row {
			sums[c] += v
		}
	}
	return sums
}

func IsSymmetric(m Matrix) bool {
	n := len(m)
	if n == 0 {
		return true
	}
	if len(m[0]) != n {
		return false
	}
	for r := range n {
		for c := r + 1; c < n; c++ {
			if m[r][c] != m[c][r] {
				return false
			}
		}
	}
	return true
}

func main() {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	fmt.Println(Transpose(m))
	fmt.Println(RowSums(m), ColSums(m))
}
