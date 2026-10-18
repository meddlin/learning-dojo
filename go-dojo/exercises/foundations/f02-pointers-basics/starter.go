package main

import "fmt"

// MinMaxInto writes the smallest and largest of values (not empty) through lo and hi.
func MinMaxInto(values []int, lo, hi *int) {
	// TODO
}

// BumpIfPositive adds one to *p and returns true if p is not nil and *p > 0.
// Otherwise it returns false and changes nothing.
func BumpIfPositive(p *int) bool {
	return false // TODO
}

// FindFirst returns a pointer to the first element of values equal to target
// (the address of the element itself, not a copy), or nil if there is none.
func FindFirst(values []int, target int) *int {
	return nil // TODO
}

// NewCounter returns a pointer to a new int holding start.
func NewCounter(start int) *int {
	return nil // TODO
}

// SwapPointers swaps which ints *a and *b point at (not the ints themselves).
func SwapPointers(a, b **int) {
	// TODO
}

func main() {
	x := 10
	p := &x
	*p = 11
	fmt.Println(x, *p)
}
