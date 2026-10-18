package main

import (
	"slices"
	"testing"
)

func chkLCG(seed uint32) func() int {
	state := seed
	return func() int {
		state = state*1664525 + 1013904223
		return int(state >> 8)
	}
}

func TestKSmallestBasics(t *testing.T) {
	Equal(t, KSmallest([]int{7, 2, 9, 4, 1, 8}, 3), []int{1, 2, 4})
	Equal(t, KSmallest([]int{5, 5, 1, 5}, 2), []int{1, 5})
	Equal(t, KSmallest([]int{3, 1, 2}, 3), []int{1, 2, 3})
}

func TestKSmallestEdgeCases(t *testing.T) {
	Equal(t, len(KSmallest([]int{1, 2, 3}, 0)), 0)
	Equal(t, len(KSmallest(nil, 0)), 0)
	Equal(t, KSmallest([]int{-3, 0, -7}, 1), []int{-7})
}

func TestKSmallestLeavesTheInputAlone(t *testing.T) {
	xs := []int{9, 3, 7, 1}
	KSmallest(xs, 2)
	Equal(t, xs, []int{9, 3, 7, 1})
}

func TestKSmallestMatchesSorting(t *testing.T) {
	next := chkLCG(7)
	for round := range 30 {
		n := 1 + next()%200
		xs := make([]int, n)
		for i := range xs {
			xs[i] = next()%1000 - 500
		}
		k := next() % (n + 1)
		sorted := slices.Clone(xs)
		slices.Sort(sorted)
		Equal(t, KSmallest(xs, k), sorted[:k], "round %d (n=%d, k=%d)", round, n, k)
	}
}

func TestKSmallestOfAHugeInput(t *testing.T) {
	next := chkLCG(99)
	xs := make([]int, 500000)
	for i := range xs {
		xs[i] = next()
	}
	got := KSmallest(xs, 5)
	sorted := slices.Clone(xs)
	slices.Sort(sorted)
	Equal(t, got, sorted[:5])
}

func TestMergeSortedLists(t *testing.T) {
	got := MergeSortedLists([][]int{{1, 4, 7}, {2, 5, 8}, {3, 6, 9}})
	Equal(t, got, []int{1, 2, 3, 4, 5, 6, 7, 8, 9})
}

func TestMergeSortedListsWithEmptyAndUnevenLists(t *testing.T) {
	Equal(t, MergeSortedLists([][]int{{}, {1, 2}, nil, {0, 5, 6, 7}}), []int{0, 1, 2, 5, 6, 7})
	Equal(t, len(MergeSortedLists(nil)), 0)
	Equal(t, len(MergeSortedLists([][]int{{}, {}})), 0)
	Equal(t, MergeSortedLists([][]int{{3, 3}, {3}}), []int{3, 3, 3})
}

func TestMergeSortedListsLeavesTheInputsAlone(t *testing.T) {
	lists := [][]int{{1, 3}, {2}}
	MergeSortedLists(lists)
	Equal(t, lists, [][]int{{1, 3}, {2}})
}

func TestMergeSortedListsMatchesSorting(t *testing.T) {
	next := chkLCG(31)
	var lists [][]int
	var all []int
	for range 40 {
		n := next() % 50
		list := make([]int, n)
		for i := range list {
			list[i] = next() % 300
		}
		slices.Sort(list)
		lists = append(lists, list)
		all = append(all, list...)
	}
	slices.Sort(all)
	Equal(t, MergeSortedLists(lists), all)
}

func TestSortByDistance(t *testing.T) {
	pts := []Pt{{3, 4}, {1, 1}, {0, 2}, {-1, -1}, {2, 0}}
	Equal(t, SortByDistance(pts), []Pt{{-1, -1}, {1, 1}, {0, 2}, {2, 0}, {3, 4}})
}

func TestSortByDistanceBreaksTiesByXThenY(t *testing.T) {
	pts := []Pt{{0, 1}, {1, 0}, {0, -1}, {-1, 0}}
	Equal(t, SortByDistance(pts), []Pt{{-1, 0}, {0, -1}, {0, 1}, {1, 0}})
}

func TestSortByDistanceLeavesTheInputAlone(t *testing.T) {
	pts := []Pt{{5, 5}, {1, 1}}
	SortByDistance(pts)
	Equal(t, pts, []Pt{{5, 5}, {1, 1}})
	Equal(t, len(SortByDistance(nil)), 0)
}

func TestMedianOfNothingIsZero(t *testing.T) {
	m := NewMedianTracker()
	Equal(t, m.Median(), 0.0)
}

func TestMedianGrowsWithTheData(t *testing.T) {
	m := NewMedianTracker()
	steps := []struct {
		add  int
		want float64
	}{{5, 5}, {15, 10}, {1, 5}, {3, 4}, {8, 5}, {7, 6}, {9, 7}}
	for _, s := range steps {
		m.Add(s.add)
		Equal(t, m.Median(), s.want, "after adding %d", s.add)
	}
}

func TestMedianWithNegativesAndDuplicates(t *testing.T) {
	m := NewMedianTracker()
	for _, x := range []int{-1, -1, -1} {
		m.Add(x)
	}
	Equal(t, m.Median(), -1.0)
	m.Add(5)
	Equal(t, m.Median(), -1.0)
	m.Add(5)
	Equal(t, m.Median(), -1.0)
	m.Add(5)
	Equal(t, m.Median(), 2.0)
}

func TestMedianMatchesSortingOnRandomData(t *testing.T) {
	next := chkLCG(5)
	m := NewMedianTracker()
	var seen []int
	for i := range 300 {
		x := next()%2001 - 1000
		m.Add(x)
		seen = append(seen, x)
		sorted := slices.Clone(seen)
		slices.Sort(sorted)
		n := len(sorted)
		want := float64(sorted[n/2])
		if n%2 == 0 {
			want = float64(sorted[n/2-1]+sorted[n/2]) / 2
		}
		Equal(t, m.Median(), want, "after %d numbers", i+1)
	}
}

func TestMedianTrackerIsFast(t *testing.T) {
	next := chkLCG(1)
	m := NewMedianTracker()
	for range 100000 {
		m.Add(next())
		m.Median()
	}
}
