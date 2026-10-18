package main

import "fmt"

// Greeting returns "Hello, <name>!", or "Hello, world!" when name is empty.
func Greeting(name string) string {
	return "" // TODO
}

// Average returns the mean of a and b as a float64: Average(7, 8) == 7.5.
func Average(a, b int) float64 {
	return 0 // TODO
}

// Describe formats n in decimal, hex and binary: Describe(42) == "42 = 0x2a = 0b101010".
func Describe(n int) string {
	return "" // TODO
}

// ZeroValues declares (without values!) an int, a string, a bool, a []int, a
// map[string]int and a *int, and returns them formatted with
// fmt.Sprintf("%v %q %v %v %v %v", i, s, b, sl, m, p).
func ZeroValues() string {
	return "" // TODO
}

func main() {
	// Scratch area: press Run to try things out here.
	fmt.Println(Greeting("Gopher"))
}
