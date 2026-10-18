package main

import "fmt"

// Evens returns the even numbers of xs, in order. Do not modify xs.
func Evens(xs []int) []int {
	return nil // TODO
}

// Reversed returns a NEW slice with the elements of xs in reverse order.
func Reversed(xs []int) []int {
	return nil // TODO
}

// Chunk splits xs into consecutive pieces of the given size (the last piece may
// be shorter). size <= 0 gives nil.
func Chunk(xs []int, size int) [][]int {
	return nil // TODO
}

// Insert returns a new slice with v inserted so that it sits at index i
// (0 <= i <= len(xs)). The original xs must be unchanged.
func Insert(xs []int, i, v int) []int {
	return nil // TODO
}

// Remove returns a new slice without the element at index i. The original xs must
// be unchanged.
func Remove(xs []int, i int) []int {
	return nil // TODO
}

func main() {
	xs := []int{1, 2, 3, 4, 5}
	fmt.Println(Evens(xs), Reversed(xs))
}
