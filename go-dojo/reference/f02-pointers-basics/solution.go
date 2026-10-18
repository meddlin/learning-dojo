package main

import "fmt"

func MinMaxInto(values []int, lo, hi *int) {
	*lo, *hi = values[0], values[0]
	for _, v := range values[1:] {
		*lo = min(*lo, v)
		*hi = max(*hi, v)
	}
}

func BumpIfPositive(p *int) bool {
	if p != nil && *p > 0 {
		*p++
		return true
	}
	return false
}

func FindFirst(values []int, target int) *int {
	for i := range values {
		if values[i] == target {
			return &values[i]
		}
	}
	return nil
}

func NewCounter(start int) *int {
	n := start
	return &n
}

func SwapPointers(a, b **int) {
	*a, *b = *b, *a
}

func main() {
	x := 10
	p := &x
	*p = 11
	fmt.Println(x, *p)
}
