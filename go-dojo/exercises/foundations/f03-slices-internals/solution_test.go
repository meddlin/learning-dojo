package main

import (
	"slices"
	"testing"
)

func TestReverseInPlace(t *testing.T) {
	xs := []int{1, 2, 3, 4, 5}
	ReverseInPlace(xs)
	Equal(t, xs, []int{5, 4, 3, 2, 1})
	ys := []int{1, 2, 3, 4}
	ReverseInPlace(ys)
	Equal(t, ys, []int{4, 3, 2, 1})
}

func TestReverseInPlaceTinySlices(t *testing.T) {
	var none []int
	ReverseInPlace(none)
	one := []int{7}
	ReverseInPlace(one)
	Equal(t, one, []int{7})
}

func TestReverseInPlaceChangesTheCallersSlice(t *testing.T) {
	backing := []int{1, 2, 3, 4, 5, 6}
	ReverseInPlace(backing[1:5])
	Equal(t, backing, []int{1, 5, 4, 3, 2, 6})
}

func chkPartitionOK(t *testing.T, xs []int) {
	t.Helper()
	before := slices.Clone(xs)
	k := PartitionEvens(xs)
	True(t, k >= 0 && k <= len(xs), "returned index %d is out of range for length %d", k, len(xs))
	for i, v := range xs {
		if i < k {
			True(t, v%2 == 0, "xs[%d] = %d should be even (index %d is before the first odd)", i, v, k)
		} else {
			True(t, v%2 != 0, "xs[%d] = %d should be odd (index %d is the first odd)", i, v, k)
		}
	}
	slices.Sort(before)
	sorted := slices.Clone(xs)
	slices.Sort(sorted)
	Equal(t, sorted, before, "the elements must only be rearranged, not changed")
}

func TestPartitionEvensMixed(t *testing.T) {
	chkPartitionOK(t, []int{1, 2, 3, 4, 5, 6, 7, 8})
	chkPartitionOK(t, []int{9, 7, 5, 2, 4, 6})
	chkPartitionOK(t, []int{2, 1, 2, 1, 2, 1})
}

func TestPartitionEvensAllOneKind(t *testing.T) {
	xs := []int{2, 4, 6}
	Equal(t, PartitionEvens(xs), 3)
	ys := []int{1, 3, 5}
	Equal(t, PartitionEvens(ys), 0)
	var none []int
	Equal(t, PartitionEvens(none), 0)
}

func TestFilterInPlaceKeepsOrder(t *testing.T) {
	xs := []int{1, 2, 3, 4, 5, 6}
	out := FilterInPlace(xs, func(n int) bool { return n%2 == 0 })
	Equal(t, out, []int{2, 4, 6})
}

func TestFilterInPlaceReusesTheMemory(t *testing.T) {
	xs := []int{5, 6, 7, 8}
	out := FilterInPlace(xs, func(n int) bool { return n > 5 })
	Equal(t, out, []int{6, 7, 8})
	True(t, len(out) > 0 && &out[0] == &xs[0], "the result should share xs's array: build it with xs[:0] and append")
	Equal(t, cap(out), cap(xs))
}

func TestFilterInPlaceKeepsEverythingOrNothing(t *testing.T) {
	xs := []int{1, 2, 3}
	Equal(t, FilterInPlace(xs, func(int) bool { return true }), []int{1, 2, 3})
	ys := []int{1, 2, 3}
	Equal(t, len(FilterInPlace(ys, func(int) bool { return false })), 0)
}

func TestClipLimitsTheCapacity(t *testing.T) {
	xs := []int{1, 2, 3, 4, 5}
	c := Clip(xs, 3)
	Equal(t, c, []int{1, 2, 3})
	Equal(t, cap(c), 3)
}

func TestAppendingToAClippedSliceDoesNotTrampleTheOriginal(t *testing.T) {
	xs := []int{1, 2, 3, 4, 5}
	c := Clip(xs, 3)
	c = append(c, 99)
	Equal(t, c, []int{1, 2, 3, 99})
	Equal(t, xs, []int{1, 2, 3, 4, 5})
}

func TestClipSharesElementsUntilItGrows(t *testing.T) {
	xs := []int{1, 2, 3, 4}
	c := Clip(xs, 2)
	c[0] = 100
	Equal(t, xs[0], 100)
	Equal(t, len(Clip(xs, 0)), 0)
	Equal(t, cap(Clip(xs, 0)), 0)
}

func TestGrowthCapsAreIncreasingAndFew(t *testing.T) {
	caps := GrowthCaps(1000)
	True(t, len(caps) > 0, "expected at least one capacity")
	for i := 1; i < len(caps); i++ {
		True(t, caps[i] > caps[i-1], "capacities must strictly increase: %v", caps)
	}
	True(t, caps[0] >= 1, "the first capacity must be at least 1, got %d", caps[0])
	True(t, caps[len(caps)-1] >= 1000, "the last capacity must hold 1000 elements: %v", caps)
	True(t, len(caps) <= 25, "append should reallocate only a handful of times (geometric growth), saw %d: %v", len(caps), caps)
}

func TestGrowthCapsOfNothing(t *testing.T) {
	Equal(t, len(GrowthCaps(0)), 0)
}

func TestGrowthCapsForOneElement(t *testing.T) {
	caps := GrowthCaps(1)
	Equal(t, len(caps), 1)
	True(t, caps[0] >= 1, "capacity should be at least 1")
}
