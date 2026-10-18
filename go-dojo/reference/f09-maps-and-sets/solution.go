package main

import (
	"fmt"
	"slices"
)

type Set[T comparable] map[T]struct{}

func NewSet[T comparable](items ...T) Set[T] {
	s := make(Set[T], len(items))
	for _, it := range items {
		s.Add(it)
	}
	return s
}

func (s Set[T]) Add(v T) { s[v] = struct{}{} }

func (s Set[T]) Has(v T) bool {
	_, ok := s[v]
	return ok
}

func (s Set[T]) Remove(v T) { delete(s, v) }

func (s Set[T]) Len() int { return len(s) }

func Union[T comparable](a, b Set[T]) Set[T] {
	out := make(Set[T], len(a)+len(b))
	for v := range a {
		out.Add(v)
	}
	for v := range b {
		out.Add(v)
	}
	return out
}

func Intersection[T comparable](a, b Set[T]) Set[T] {
	out := make(Set[T])
	for v := range a {
		if b.Has(v) {
			out.Add(v)
		}
	}
	return out
}

func FirstDuplicate(xs []int) (int, bool) {
	seen := NewSet[int]()
	for _, x := range xs {
		if seen.Has(x) {
			return x, true
		}
		seen.Add(x)
	}
	return 0, false
}

func TwoSum(nums []int, target int) (i, j int, ok bool) {
	seen := make(map[int]int)
	for j, x := range nums {
		if i, found := seen[target-x]; found {
			return i, j, true
		}
		seen[x] = j
	}
	return 0, 0, false
}

func GroupAnagrams(words []string) [][]string {
	index := make(map[string]int)
	var groups [][]string
	for _, w := range words {
		r := []rune(w)
		slices.Sort(r)
		key := string(r)
		g, ok := index[key]
		if !ok {
			g = len(groups)
			index[key] = g
			groups = append(groups, nil)
		}
		groups[g] = append(groups[g], w)
	}
	return groups
}

type Point struct{ X, Y int }

func CountPoints(pts []Point) map[Point]int {
	counts := make(map[Point]int)
	for _, p := range pts {
		counts[p]++
	}
	return counts
}

func main() {
	s := NewSet(1, 2, 3)
	fmt.Println(s.Has(2), s.Len())
}
