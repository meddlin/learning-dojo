package main

import (
	"fmt"
	"math"
)

// AddOverflows reports whether a + b would not fit in an int32.
func AddOverflows(a, b int32) bool {
	return false // TODO
}

// DigitSum returns the sum of the decimal digits of n, ignoring the sign.
// DigitSum(-482) == 14. Careful with math.MinInt32: -n wraps around.
func DigitSum(n int32) int {
	return 0 // TODO
}

// RotateLeft rotates the bits of x left by k positions; bits that fall off the
// left end come back in on the right. k can be any value, including 0 and 40.
func RotateLeft(x uint32, k uint) uint32 {
	return 0 // TODO
}

// SaturatingAddInt8 returns a + b clamped to -128..127 instead of wrapping.
func SaturatingAddInt8(a, b int8) int8 {
	return 0 // TODO
}

func main() {
	// Scratch area: press Run to try things out here.
	var x int32 = math.MaxInt32
	x++
	fmt.Println("MaxInt32 + 1 wraps to", x)
}
