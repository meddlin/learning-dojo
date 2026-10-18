package main

import "fmt"

func ReverseInPlace(xs []int) {
	for i, j := 0, len(xs)-1; i < j; i, j = i+1, j-1 {
		xs[i], xs[j] = xs[j], xs[i]
	}
}

func PartitionEvens(xs []int) int {
	i, j := 0, len(xs)-1
	for i <= j {
		switch {
		case xs[i]%2 == 0:
			i++
		case xs[j]%2 != 0:
			j--
		default:
			xs[i], xs[j] = xs[j], xs[i]
			i++
			j--
		}
	}
	return i
}

func FilterInPlace(xs []int, keep func(int) bool) []int {
	out := xs[:0]
	for _, x := range xs {
		if keep(x) {
			out = append(out, x)
		}
	}
	return out
}

func Clip(xs []int, n int) []int {
	return xs[:n:n]
}

func GrowthCaps(n int) []int {
	var s []int
	var caps []int
	last := cap(s)
	for i := range n {
		s = append(s, i)
		if cap(s) != last {
			last = cap(s)
			caps = append(caps, last)
		}
	}
	return caps
}

func main() {
	a := []int{1, 2, 3, 4}
	b := a[:2]
	b = append(b, 99)
	fmt.Println(a, b, len(b), cap(b))
}
