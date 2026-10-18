package main

import "fmt"

func Evens(xs []int) []int {
	var out []int
	for _, x := range xs {
		if x%2 == 0 {
			out = append(out, x)
		}
	}
	return out
}

func Reversed(xs []int) []int {
	out := make([]int, len(xs))
	for i, x := range xs {
		out[len(xs)-1-i] = x
	}
	return out
}

func Chunk(xs []int, size int) [][]int {
	if size <= 0 {
		return nil
	}
	var out [][]int
	for start := 0; start < len(xs); start += size {
		out = append(out, xs[start:min(start+size, len(xs))])
	}
	return out
}

func Insert(xs []int, i, v int) []int {
	out := make([]int, 0, len(xs)+1)
	out = append(out, xs[:i]...)
	out = append(out, v)
	out = append(out, xs[i:]...)
	return out
}

func Remove(xs []int, i int) []int {
	out := make([]int, 0, len(xs)-1)
	out = append(out, xs[:i]...)
	out = append(out, xs[i+1:]...)
	return out
}

func main() {
	xs := []int{1, 2, 3, 4, 5}
	fmt.Println(Evens(xs), Reversed(xs))
}
