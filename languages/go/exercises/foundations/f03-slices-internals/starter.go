package main

import "fmt"

// ReverseInPlace reverses xs using two indices that walk toward each other.
func ReverseInPlace(xs []int) {
	// TODO
}

// PartitionEvens rearranges xs so every even number comes before every odd one,
// and returns the index of the first odd number (len(xs) if there is none).
func PartitionEvens(xs []int) int {
	return -1 // TODO
}

// FilterInPlace keeps the elements for which keep returns true, in order,
// reusing xs's memory. It returns the shortened slice.
func FilterInPlace(xs []int, keep func(int) bool) []int {
	return nil // TODO
}

// Clip returns xs[:n] with its capacity limited to n, so appending to the result
// can never overwrite xs[n] and beyond.
func Clip(xs []int, n int) []int {
	return nil // TODO
}

// GrowthCaps appends n ints one at a time to an empty slice and returns every
// distinct capacity observed, in order.
func GrowthCaps(n int) []int {
	return nil // TODO
}

func main() {
	a := []int{1, 2, 3, 4}
	b := a[:2]
	b = append(b, 99)
	fmt.Println(a, b, len(b), cap(b))
}
