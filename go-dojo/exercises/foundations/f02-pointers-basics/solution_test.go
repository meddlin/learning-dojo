package main

import "testing"

func TestMinMaxInto(t *testing.T) {
	var lo, hi int
	MinMaxInto([]int{3, -1, 7, 2}, &lo, &hi)
	Equal(t, lo, -1)
	Equal(t, hi, 7)
}

func TestMinMaxIntoOfOneValue(t *testing.T) {
	var lo, hi int
	MinMaxInto([]int{42}, &lo, &hi)
	Equal(t, lo, 42)
	Equal(t, hi, 42)
}

func TestBumpIfPositive(t *testing.T) {
	n := 5
	True(t, BumpIfPositive(&n))
	Equal(t, n, 6)
}

func TestBumpLeavesZeroAndNegativesAlone(t *testing.T) {
	z, neg := 0, -3
	False(t, BumpIfPositive(&z))
	False(t, BumpIfPositive(&neg))
	Equal(t, z, 0)
	Equal(t, neg, -3)
}

func TestBumpSurvivesNil(t *testing.T) {
	False(t, BumpIfPositive(nil))
}

func TestFindFirstReturnsAnAddressIntoTheSlice(t *testing.T) {
	xs := []int{4, 8, 15, 8, 23}
	p := FindFirst(xs, 8)
	True(t, p != nil, "expected a pointer to the first 8")
	*p = 99
	Equal(t, xs, []int{4, 99, 15, 8, 23})
}

func TestFindFirstWhenAbsent(t *testing.T) {
	True(t, FindFirst([]int{1, 2, 3}, 9) == nil, "expected nil")
	True(t, FindFirst(nil, 1) == nil, "expected nil for an empty slice")
}

func TestFindFirstPointsAtTheFirstMatchOnly(t *testing.T) {
	xs := []int{7, 7, 7}
	p := FindFirst(xs, 7)
	True(t, p == &xs[0], "expected the address of xs[0]")
}

func TestNewCounter(t *testing.T) {
	c := NewCounter(5)
	True(t, c != nil, "expected a pointer")
	Equal(t, *c, 5)
	*c++
	Equal(t, *c, 6)
}

func TestNewCounterReturnsIndependentVariables(t *testing.T) {
	a, b := NewCounter(0), NewCounter(0)
	True(t, a != b, "each call must return a different variable")
	*a = 10
	Equal(t, *b, 0)
}

func TestSwapPointersSwapsTheTargetsNotTheValues(t *testing.T) {
	x, y := 1, 2
	px, py := &x, &y
	SwapPointers(&px, &py)
	True(t, px == &y && py == &x, "the pointers should now point at each other's variable")
	Equal(t, x, 1)
	Equal(t, y, 2)
	Equal(t, *px, 2)
}
