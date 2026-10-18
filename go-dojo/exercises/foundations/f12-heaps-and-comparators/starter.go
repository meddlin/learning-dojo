package main

import "fmt"

// Pt is a point in the plane.
type Pt struct{ X, Y int }

// KSmallest returns the k smallest values of xs in ascending order, using a heap
// that never holds more than k elements. xs is unchanged.
func KSmallest(xs []int, k int) []int {
	return nil // TODO
}

// MergeSortedLists merges individually sorted lists into one sorted list, using a
// min-heap with one candidate per list.
func MergeSortedLists(lists [][]int) []int {
	return nil // TODO
}

// SortByDistance returns a new slice of the points sorted by distance from the
// origin, nearest first (compare squared distances). Ties: by X, then by Y.
func SortByDistance(points []Pt) []Pt {
	return nil // TODO
}

// MedianTracker keeps a running median of the numbers added so far.
// (Hint: two heaps. Add whatever fields you need.)
type MedianTracker struct {
}

// NewMedianTracker returns an empty tracker.
func NewMedianTracker() *MedianTracker {
	return &MedianTracker{} // TODO
}

// Add records x.
func (m *MedianTracker) Add(x int) {
	// TODO
}

// Median returns the median of everything added so far (0 if nothing was added).
// For an even count it is the mean of the two middle values.
func (m *MedianTracker) Median() float64 {
	return -1 // TODO
}

func main() {
	fmt.Println(KSmallest([]int{5, 2, 8, 1, 9}, 3))
}
