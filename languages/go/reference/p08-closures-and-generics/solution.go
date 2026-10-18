package main

import (
	"cmp"
	"fmt"
)

func Counter() func() int {
	n := 0
	return func() int {
		n++
		return n
	}
}

func MakeAdders(n int) []func(int) int {
	var adders []func(int) int
	for i := range n {
		adders = append(adders, func(x int) int { return x + i })
	}
	return adders
}

func Map[T, U any](xs []T, f func(T) U) []U {
	out := make([]U, len(xs))
	for i, x := range xs {
		out[i] = f(x)
	}
	return out
}

func Filter[T any](xs []T, keep func(T) bool) []T {
	var out []T
	for _, x := range xs {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func Reduce[T, A any](xs []T, init A, f func(A, T) A) A {
	acc := init
	for _, x := range xs {
		acc = f(acc, x)
	}
	return acc
}

func MaxOf[T cmp.Ordered](xs ...T) (T, bool) {
	var zero T
	if len(xs) == 0 {
		return zero, false
	}
	best := xs[0]
	for _, x := range xs[1:] {
		if x > best {
			best = x
		}
	}
	return best, true
}

func main() {
	next := Counter()
	fmt.Println(next(), next())
}
