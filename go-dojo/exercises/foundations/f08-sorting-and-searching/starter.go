package main

import "fmt"

// Person has a name and an age.
type Person struct {
	Name string
	Age  int
}

// SortByLength returns a NEW slice, shortest words first. Words of equal length
// keep their original relative order. The input is unchanged.
func SortByLength(words []string) []string {
	return nil // TODO
}

// SortPeople sorts in place: oldest first; same age by name, A to Z.
func SortPeople(people []Person) {
	// TODO
}

// LowerBound returns the first index i of the ascending slice xs with
// xs[i] >= target, or len(xs) if there is none. Write the binary search by hand.
func LowerBound(xs []int, target int) int {
	return -1 // TODO
}

// BinarySearch returns an index holding target in the ascending slice xs, or -1.
func BinarySearch(xs []int, target int) int {
	return -2 // TODO
}

// MergeSorted merges two ascending slices into a new ascending slice in O(n + m).
func MergeSorted(a, b []int) []int {
	return nil // TODO
}

func main() {
	fmt.Println(SortByLength([]string{"ccc", "a", "bb", "d"}))
}
