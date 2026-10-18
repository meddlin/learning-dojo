package main

import (
	"slices"
	"testing"
)

func chkItems[T int | string](s Set[T]) []T {
	out := make([]T, 0, len(s))
	for v := range s {
		out = append(out, v)
	}
	slices.Sort(out)
	return out
}

func TestSetBasics(t *testing.T) {
	s := NewSet(1, 2, 3, 2)
	Equal(t, s.Len(), 3)
	True(t, s.Has(2))
	False(t, s.Has(9))
	s.Add(9)
	s.Add(9)
	Equal(t, s.Len(), 4)
	True(t, s.Has(9))
	s.Remove(1)
	s.Remove(1)
	False(t, s.Has(1))
	Equal(t, s.Len(), 3)
}

func TestSetWorksForStringsAndStartsEmpty(t *testing.T) {
	s := NewSet[string]()
	Equal(t, s.Len(), 0)
	s.Add("go")
	True(t, s.Has("go"))
	False(t, s.Has("rust"))
}

func TestUnion(t *testing.T) {
	a, b := NewSet(1, 2, 3), NewSet(3, 4)
	u := Union(a, b)
	Equal(t, chkItems(u), []int{1, 2, 3, 4})
	Equal(t, chkItems(a), []int{1, 2, 3}, "the inputs must not change")
	Equal(t, chkItems(b), []int{3, 4}, "the inputs must not change")
}

func TestIntersection(t *testing.T) {
	a, b := NewSet(1, 2, 3, 4), NewSet(3, 4, 5)
	Equal(t, chkItems(Intersection(a, b)), []int{3, 4})
	Equal(t, chkItems(Intersection(a, NewSet(9))), []int{})
	Equal(t, chkItems(a), []int{1, 2, 3, 4})
}

func TestUnionAndIntersectionWithEmptySets(t *testing.T) {
	a := NewSet(1, 2)
	e := NewSet[int]()
	Equal(t, chkItems(Union(a, e)), []int{1, 2})
	Equal(t, chkItems(Union(e, e)), []int{})
	Equal(t, chkItems(Intersection(a, e)), []int{})
}

func TestFirstDuplicate(t *testing.T) {
	v, ok := FirstDuplicate([]int{3, 1, 4, 1, 5, 3})
	True(t, ok)
	Equal(t, v, 1)
}

func TestFirstDuplicateReportsTheFirstRepeatNotTheFirstRepeatedValue(t *testing.T) {
	v, ok := FirstDuplicate([]int{2, 1, 3, 1, 2})
	True(t, ok)
	Equal(t, v, 1, "1 repeats at index 3, before 2 repeats at index 4")
}

func TestFirstDuplicateWhenAllDistinct(t *testing.T) {
	_, ok := FirstDuplicate([]int{1, 2, 3})
	False(t, ok)
	_, ok = FirstDuplicate(nil)
	False(t, ok)
}

func TestFirstDuplicateCanReturnZero(t *testing.T) {
	v, ok := FirstDuplicate([]int{0, 5, 0})
	True(t, ok, "0 is a legitimate duplicate value")
	Equal(t, v, 0)
}

func TestTwoSum(t *testing.T) {
	i, j, ok := TwoSum([]int{2, 7, 11, 15}, 9)
	True(t, ok)
	Equal(t, i, 0)
	Equal(t, j, 1)
	i, j, ok = TwoSum([]int{3, 2, 4}, 6)
	True(t, ok)
	Equal(t, i, 1)
	Equal(t, j, 2)
}

func TestTwoSumWithNegativesAndDuplicates(t *testing.T) {
	i, j, ok := TwoSum([]int{3, 3}, 6)
	True(t, ok)
	Equal(t, i, 0)
	Equal(t, j, 1)
	i, j, ok = TwoSum([]int{-1, -2, -3, -4, -5}, -8)
	True(t, ok)
	Equal(t, i, 2)
	Equal(t, j, 4)
}

func TestTwoSumWhenThereIsNone(t *testing.T) {
	_, _, ok := TwoSum([]int{1, 2, 3}, 100)
	False(t, ok)
	_, _, ok = TwoSum([]int{5}, 10)
	False(t, ok, "an element cannot pair with itself")
	_, _, ok = TwoSum(nil, 0)
	False(t, ok)
}

func TestTwoSumOnALargeInputFinishesQuickly(t *testing.T) {
	nums := make([]int, 200000)
	for i := range nums {
		nums[i] = i * 2
	}
	i, j, ok := TwoSum(nums, nums[150000]+nums[199999])
	True(t, ok)
	Equal(t, nums[i]+nums[j], nums[150000]+nums[199999])
}

func TestGroupAnagrams(t *testing.T) {
	got := GroupAnagrams([]string{"eat", "tea", "tan", "ate", "nat", "bat"})
	Equal(t, got, [][]string{{"eat", "tea", "ate"}, {"tan", "nat"}, {"bat"}})
}

func TestGroupAnagramsEdgeCases(t *testing.T) {
	Equal(t, len(GroupAnagrams(nil)), 0)
	Equal(t, GroupAnagrams([]string{"a", "b", "a"}), [][]string{{"a", "a"}, {"b"}})
	Equal(t, GroupAnagrams([]string{"", ""}), [][]string{{"", ""}})
}

func TestGroupAnagramsIsCaseSensitiveAndUnicodeAware(t *testing.T) {
	Equal(t, GroupAnagrams([]string{"Ab", "ba", "bA"}), [][]string{{"Ab", "bA"}, {"ba"}})
	Equal(t, GroupAnagrams([]string{"éa", "aé"}), [][]string{{"éa", "aé"}})
}

func TestGroupAnagramsIsDeterministic(t *testing.T) {
	words := []string{"stop", "pots", "tops", "opts", "post", "spot", "abc", "cab", "bca", "xyz"}
	want := [][]string{{"stop", "pots", "tops", "opts", "post", "spot"}, {"abc", "cab", "bca"}, {"xyz"}}
	for range 20 {
		Equal(t, GroupAnagrams(words), want)
	}
}

func TestCountPoints(t *testing.T) {
	pts := []Point{{1, 2}, {3, 4}, {1, 2}, {1, 2}, {0, 0}}
	Equal(t, CountPoints(pts), map[Point]int{{1, 2}: 3, {3, 4}: 1, {0, 0}: 1})
	Equal(t, len(CountPoints(nil)), 0)
}
