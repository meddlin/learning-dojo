package main

import (
	"strconv"
	"strings"
	"testing"
)

func TestCounterCounts(t *testing.T) {
	next := Counter()
	Equal(t, next(), 1)
	Equal(t, next(), 2)
	Equal(t, next(), 3)
}

func TestCountersAreIndependent(t *testing.T) {
	a, b := Counter(), Counter()
	a()
	a()
	Equal(t, b(), 1)
	Equal(t, a(), 3)
}

func TestMakeAdders(t *testing.T) {
	adders := MakeAdders(4)
	Equal(t, len(adders), 4)
	for i, add := range adders {
		Equal(t, add(100), 100+i, "adder %d", i)
	}
}

func TestMakeAddersOfNothing(t *testing.T) {
	Equal(t, len(MakeAdders(0)), 0)
}

func TestMapChangesTheType(t *testing.T) {
	Equal(t, Map([]int{1, 2, 3}, func(n int) int { return n * n }), []int{1, 4, 9})
	Equal(t, Map([]int{1, 2, 3}, strconv.Itoa), []string{"1", "2", "3"})
	Equal(t, Map([]string{"a", "bb", "ccc"}, func(s string) int { return len(s) }), []int{1, 2, 3})
	Equal(t, len(Map([]int(nil), strconv.Itoa)), 0)
}

func TestFilter(t *testing.T) {
	even := func(n int) bool { return n%2 == 0 }
	Equal(t, Filter([]int{1, 2, 3, 4, 5, 6}, even), []int{2, 4, 6})
	Equal(t, Filter([]string{"go", "", "dojo", ""}, func(s string) bool { return s != "" }), []string{"go", "dojo"})
	Equal(t, len(Filter([]int{1, 3}, even)), 0)
}

func TestFilterDoesNotModifyTheInput(t *testing.T) {
	xs := []int{1, 2, 3, 4}
	Filter(xs, func(n int) bool { return n > 2 })
	Equal(t, xs, []int{1, 2, 3, 4})
}

func TestReduce(t *testing.T) {
	sum := Reduce([]int{1, 2, 3, 4}, 0, func(acc, x int) int { return acc + x })
	Equal(t, sum, 10)
	joined := Reduce([]string{"a", "b", "c"}, "", func(acc string, s string) string { return acc + s })
	Equal(t, joined, "abc")
	Equal(t, Reduce([]int(nil), 42, func(acc, x int) int { return acc + x }), 42)
}

func TestReduceCanChangeTheAccumulatorType(t *testing.T) {
	lengths := Reduce([]string{"go", "dojo"}, 0, func(acc int, s string) int { return acc + len(s) })
	Equal(t, lengths, 6)
	csv := Reduce([]int{1, 2, 3}, "", func(acc string, n int) string {
		if acc == "" {
			return strconv.Itoa(n)
		}
		return strings.Join([]string{acc, strconv.Itoa(n)}, ",")
	})
	Equal(t, csv, "1,2,3")
}

func TestMaxOfWorksForSeveralTypes(t *testing.T) {
	m, ok := MaxOf(3, 9, 4)
	Equal(t, m, 9)
	True(t, ok)
	f, ok := MaxOf(2.5, -1.0)
	Equal(t, f, 2.5)
	True(t, ok)
	s, ok := MaxOf("pear", "zebra", "apple")
	Equal(t, s, "zebra")
	True(t, ok)
}

func TestMaxOfNothing(t *testing.T) {
	m, ok := MaxOf[int]()
	Equal(t, m, 0)
	False(t, ok)
	s, ok := MaxOf[string]()
	Equal(t, s, "")
	False(t, ok)
}
