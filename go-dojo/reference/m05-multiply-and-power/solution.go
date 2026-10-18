package main

import "fmt"

type Mat [][]int64

func Identity(n int) Mat {
	m := make(Mat, n)
	for i := range m {
		m[i] = make([]int64, n)
		m[i][i] = 1
	}
	return m
}

func Multiply(a, b Mat) Mat {
	n, k, m := len(a), len(b), len(b[0])
	c := make(Mat, n)
	for i := range c {
		c[i] = make([]int64, m)
		for j := range m {
			for t := range k {
				c[i][j] += a[i][t] * b[t][j]
			}
		}
	}
	return c
}

func MatPow(m Mat, exp int64) Mat {
	result := Identity(len(m))
	base := m
	for exp > 0 {
		if exp&1 == 1 {
			result = Multiply(result, base)
		}
		base = Multiply(base, base)
		exp >>= 1
	}
	return result
}

func Fibonacci(n int) int64 {
	return MatPow(Mat{{1, 1}, {1, 0}}, int64(n))[0][1]
}

func main() {
	a := Mat{{1, 2}, {3, 4}}
	b := Mat{{5, 6}, {7, 8}}
	fmt.Println(Multiply(a, b))
	fmt.Println(Fibonacci(10))
}
