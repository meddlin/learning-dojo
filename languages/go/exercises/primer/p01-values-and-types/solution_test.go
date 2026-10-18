package main

import "testing"

func TestGreeting(t *testing.T) {
	Equal(t, Greeting("Ada"), "Hello, Ada!")
	Equal(t, Greeting("Go"), "Hello, Go!")
}

func TestGreetingWithoutAName(t *testing.T) {
	Equal(t, Greeting(""), "Hello, world!")
}

func TestAverageNeedsFloatingPointDivision(t *testing.T) {
	Equal(t, Average(7, 8), 7.5)
	Equal(t, Average(1, 2), 1.5)
	Equal(t, Average(-3, 4), 0.5)
	Equal(t, Average(10, 20), 15.0)
}

func TestDescribeShowsThreeBases(t *testing.T) {
	Equal(t, Describe(42), "42 = 0x2a = 0b101010")
	Equal(t, Describe(255), "255 = 0xff = 0b11111111")
	Equal(t, Describe(0), "0 = 0x0 = 0b0")
}

func TestZeroValues(t *testing.T) {
	Equal(t, ZeroValues(), `0 "" false [] map[] <nil>`)
}
