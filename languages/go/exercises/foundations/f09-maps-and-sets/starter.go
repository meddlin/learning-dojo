package main

import "fmt"

// Set is a set of comparable values.
type Set[T comparable] map[T]struct{}

// NewSet returns a set holding items.
func NewSet[T comparable](items ...T) Set[T] {
	return nil // TODO
}

// Add inserts v.
func (s Set[T]) Add(v T) {
	// TODO
}

// Has reports whether v is in the set.
func (s Set[T]) Has(v T) bool {
	return false // TODO
}

// Remove deletes v (a no-op if absent).
func (s Set[T]) Remove(v T) {
	// TODO
}

// Len returns the number of elements.
func (s Set[T]) Len() int {
	return -1 // TODO
}

// Union returns a new set with the elements of a and b.
func Union[T comparable](a, b Set[T]) Set[T] {
	return nil // TODO
}

// Intersection returns a new set with the elements present in both a and b.
func Intersection[T comparable](a, b Set[T]) Set[T] {
	return nil // TODO
}

// FirstDuplicate returns the first value (scanning left to right) that already
// appeared earlier, or 0, false if all values are distinct.
func FirstDuplicate(xs []int) (int, bool) {
	return 0, false // TODO
}

// TwoSum returns indices i < j with nums[i] + nums[j] == target, in one pass.
func TwoSum(nums []int, target int) (i, j int, ok bool) {
	return 0, 0, false // TODO
}

// GroupAnagrams groups words that are anagrams of each other. Groups appear in
// order of their first word; words keep their input order within a group.
func GroupAnagrams(words []string) [][]string {
	return nil // TODO
}

// Point is a cell on a grid.
type Point struct{ X, Y int }

// CountPoints returns how many times each point occurs in pts.
func CountPoints(pts []Point) map[Point]int {
	return nil // TODO
}

func main() {
	s := NewSet(1, 2, 3)
	fmt.Println(s.Has(2), s.Len())
}
