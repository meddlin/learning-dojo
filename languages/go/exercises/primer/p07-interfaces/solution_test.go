package main

import (
	"fmt"
	"math"
	"testing"
)

func TestCircleAndSquareAreShapes(t *testing.T) {
	var s Shape = Circle{1}
	Near(t, s.Area(), math.Pi, 1e-9)
	Near(t, s.Perimeter(), 2*math.Pi, 1e-9)
	s = Square{3}
	Near(t, s.Area(), 9, 1e-9)
	Near(t, s.Perimeter(), 12, 1e-9)
}

func TestTotalArea(t *testing.T) {
	shapes := []Shape{Circle{1}, Square{2}, Square{1}}
	Near(t, TotalArea(shapes), math.Pi+4+1, 1e-9)
	Equal(t, TotalArea(nil), 0.0)
}

func TestDescribeInts(t *testing.T) {
	Equal(t, Describe(5), "int 5")
	Equal(t, Describe(-12), "int -12")
}

func TestDescribeStrings(t *testing.T) {
	Equal(t, Describe("hi"), `string "hi"`)
	Equal(t, Describe(""), `string ""`)
}

func TestDescribeSlicesNilAndOthers(t *testing.T) {
	Equal(t, Describe([]int{1, 2, 3}), "slice of 3 ints")
	Equal(t, Describe([]int{}), "slice of 0 ints")
	Equal(t, Describe(nil), "nil")
	Equal(t, Describe(3.5), "unknown")
	Equal(t, Describe(true), "unknown")
}

func TestWeekdayNames(t *testing.T) {
	Equal(t, Sunday.String(), "Sunday")
	Equal(t, Tuesday.String(), "Tuesday")
	Equal(t, Saturday.String(), "Saturday")
}

func TestWeekdayWorksWithFmt(t *testing.T) {
	Equal(t, fmt.Sprint(Wednesday), "Wednesday")
	Equal(t, fmt.Sprintf("%v and %s", Monday, Friday), "Monday and Friday")
}

func TestWeekdayOutOfRange(t *testing.T) {
	Equal(t, Weekday(9).String(), "Weekday(9)")
	Equal(t, Weekday(-1).String(), "Weekday(-1)")
}
