package main

import "fmt"

type Matrix [][]int

func SpiralOrder(m Matrix) []int {
	if len(m) == 0 {
		return nil
	}
	var out []int
	top, bottom := 0, len(m)-1
	left, right := 0, len(m[0])-1
	for top <= bottom && left <= right {
		for c := left; c <= right; c++ {
			out = append(out, m[top][c])
		}
		top++
		for r := top; r <= bottom; r++ {
			out = append(out, m[r][right])
		}
		right--
		if top <= bottom {
			for c := right; c >= left; c-- {
				out = append(out, m[bottom][c])
			}
			bottom--
		}
		if left <= right {
			for r := bottom; r >= top; r-- {
				out = append(out, m[r][left])
			}
			left++
		}
	}
	return out
}

func SpiralMatrix(n int) Matrix {
	if n == 0 {
		return nil
	}
	m := make(Matrix, n)
	for r := range m {
		m[r] = make([]int, n)
	}
	next := 1
	top, bottom, left, right := 0, n-1, 0, n-1
	for top <= bottom && left <= right {
		for c := left; c <= right; c++ {
			m[top][c] = next
			next++
		}
		top++
		for r := top; r <= bottom; r++ {
			m[r][right] = next
			next++
		}
		right--
		if top <= bottom {
			for c := right; c >= left; c-- {
				m[bottom][c] = next
				next++
			}
			bottom--
		}
		if left <= right {
			for r := bottom; r >= top; r-- {
				m[r][left] = next
				next++
			}
			left++
		}
	}
	return m
}

func main() {
	fmt.Println(SpiralOrder(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}))
	fmt.Println(SpiralMatrix(3))
}
