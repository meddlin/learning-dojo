package main

import (
	"slices"
	"testing"
)

func TestSortByLength(t *testing.T) {
	got := SortByLength([]string{"ccc", "a", "bb", "dddd", "e"})
	Equal(t, got, []string{"a", "e", "bb", "ccc", "dddd"})
}

func TestSortByLengthIsStable(t *testing.T) {
	got := SortByLength([]string{"bb", "aa", "c", "dd", "b", "cc"})
	Equal(t, got, []string{"c", "b", "bb", "aa", "dd", "cc"})
}

func TestSortByLengthLeavesTheInputAlone(t *testing.T) {
	in := []string{"ccc", "a", "bb"}
	SortByLength(in)
	Equal(t, in, []string{"ccc", "a", "bb"})
}

func TestSortByLengthOfNothing(t *testing.T) {
	Equal(t, len(SortByLength(nil)), 0)
}

func TestSortPeopleByAgeThenName(t *testing.T) {
	people := []Person{{"Zed", 30}, {"Amy", 25}, {"Bob", 30}, {"Cat", 41}, {"Abe", 25}}
	SortPeople(people)
	Equal(t, people, []Person{{"Cat", 41}, {"Bob", 30}, {"Zed", 30}, {"Abe", 25}, {"Amy", 25}})
}

func TestSortPeopleWorksOnTheCallersSlice(t *testing.T) {
	people := []Person{{"B", 1}, {"A", 2}}
	alias := people
	SortPeople(people)
	Equal(t, alias, []Person{{"A", 2}, {"B", 1}})
}

func TestLowerBound(t *testing.T) {
	xs := []int{1, 3, 3, 3, 5, 8}
	Equal(t, LowerBound(xs, 0), 0)
	Equal(t, LowerBound(xs, 1), 0)
	Equal(t, LowerBound(xs, 2), 1)
	Equal(t, LowerBound(xs, 3), 1)
	Equal(t, LowerBound(xs, 4), 4)
	Equal(t, LowerBound(xs, 8), 5)
	Equal(t, LowerBound(xs, 9), 6)
}

func TestLowerBoundOnEmpty(t *testing.T) {
	Equal(t, LowerBound(nil, 5), 0)
}

func TestLowerBoundAgreesWithTheStandardLibrary(t *testing.T) {
	xs := []int{-5, -5, 0, 2, 2, 2, 7, 9, 9, 12, 40}
	for target := -7; target <= 42; target++ {
		want, _ := slices.BinarySearch(xs, target)
		Equal(t, LowerBound(xs, target), want, "target %d", target)
	}
}

func TestBinarySearchFindsPresentValues(t *testing.T) {
	xs := []int{2, 4, 6, 8, 10, 12}
	for i, v := range xs {
		Equal(t, BinarySearch(xs, v), i, "looking for %d", v)
	}
}

func TestBinarySearchMissesAbsentValues(t *testing.T) {
	xs := []int{2, 4, 6, 8}
	for _, v := range []int{1, 3, 5, 7, 9, 100, -3} {
		Equal(t, BinarySearch(xs, v), -1, "looking for %d", v)
	}
	Equal(t, BinarySearch(nil, 1), -1)
}

func TestBinarySearchWithDuplicatesReturnsAMatchingIndex(t *testing.T) {
	xs := []int{1, 2, 2, 2, 3}
	i := BinarySearch(xs, 2)
	True(t, i >= 1 && i <= 3, "expected an index between 1 and 3, got %d", i)
}

func TestBinarySearchIsFastOnAHugeSlice(t *testing.T) {
	xs := make([]int, 3_000_000)
	for i := range xs {
		xs[i] = 2 * i
	}
	for i := 0; i < len(xs); i += 997 {
		Equal(t, BinarySearch(xs, xs[i]), i)
		Equal(t, BinarySearch(xs, xs[i]+1), -1)
	}
}

func TestMergeSorted(t *testing.T) {
	Equal(t, MergeSorted([]int{1, 4, 7}, []int{2, 3, 9, 10}), []int{1, 2, 3, 4, 7, 9, 10})
	Equal(t, MergeSorted([]int{1, 1, 2}, []int{1, 2, 2}), []int{1, 1, 1, 2, 2, 2})
}

func TestMergeSortedWithEmptyInputs(t *testing.T) {
	Equal(t, MergeSorted(nil, []int{1, 2}), []int{1, 2})
	Equal(t, MergeSorted([]int{3}, nil), []int{3})
	Equal(t, len(MergeSorted(nil, nil)), 0)
}

func TestMergeSortedLeavesTheInputsAlone(t *testing.T) {
	a, b := []int{1, 5}, []int{2, 6}
	out := MergeSorted(a, b)
	out[0] = 99
	Equal(t, a, []int{1, 5})
	Equal(t, b, []int{2, 6})
}
