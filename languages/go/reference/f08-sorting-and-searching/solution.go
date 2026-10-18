package main

import (
	"cmp"
	"fmt"
	"slices"
)

type Person struct {
	Name string
	Age  int
}

func SortByLength(words []string) []string {
	out := slices.Clone(words)
	slices.SortStableFunc(out, func(a, b string) int { return cmp.Compare(len(a), len(b)) })
	return out
}

func SortPeople(people []Person) {
	slices.SortFunc(people, func(a, b Person) int {
		return cmp.Or(cmp.Compare(b.Age, a.Age), cmp.Compare(a.Name, b.Name))
	})
}

func LowerBound(xs []int, target int) int {
	lo, hi := 0, len(xs)
	for lo < hi {
		mid := lo + (hi-lo)/2
		if xs[mid] < target {
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	return lo
}

func BinarySearch(xs []int, target int) int {
	i := LowerBound(xs, target)
	if i < len(xs) && xs[i] == target {
		return i
	}
	return -1
}

func MergeSorted(a, b []int) []int {
	out := make([]int, 0, len(a)+len(b))
	i, j := 0, 0
	for i < len(a) && j < len(b) {
		if a[i] <= b[j] {
			out = append(out, a[i])
			i++
		} else {
			out = append(out, b[j])
			j++
		}
	}
	out = append(out, a[i:]...)
	out = append(out, b[j:]...)
	return out
}

func main() {
	fmt.Println(SortByLength([]string{"ccc", "a", "bb", "d"}))
}
