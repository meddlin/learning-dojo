package main

import (
	"cmp"
	"fmt"
)

// Counter returns a function that gives 1, then 2, then 3... on successive calls.
// Every call to Counter makes an independent count.
func Counter() func() int {
	return func() int { return 0 } // TODO
}

// MakeAdders returns n functions; the one at index i adds i to its argument.
func MakeAdders(n int) []func(int) int {
	return nil // TODO
}

// Map applies f to every element and returns the results.
func Map[T, U any](xs []T, f func(T) U) []U {
	return nil // TODO
}

// Filter returns the elements for which keep returns true, in order.
func Filter[T any](xs []T, keep func(T) bool) []T {
	return nil // TODO
}

// Reduce folds xs from the left: acc = f(acc, x) for each x, starting from init.
func Reduce[T, A any](xs []T, init A, f func(A, T) A) A {
	var zero A
	return zero // TODO
}

// MaxOf returns the largest argument, or the zero value and false if there are none.
func MaxOf[T cmp.Ordered](xs ...T) (T, bool) {
	var zero T
	return zero, false // TODO
}

func main() {
	next := Counter()
	fmt.Println(next(), next())
}
