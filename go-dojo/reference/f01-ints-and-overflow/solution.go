package main

import (
	"fmt"
	"math"
)

func AddOverflows(a, b int32) bool {
	s := int64(a) + int64(b)
	return s > math.MaxInt32 || s < math.MinInt32
}

func DigitSum(n int32) int {
	v := int64(n)
	if v < 0 {
		v = -v
	}
	sum := 0
	for v > 0 {
		sum += int(v % 10)
		v /= 10
	}
	return sum
}

func RotateLeft(x uint32, k uint) uint32 {
	k %= 32
	return x<<k | x>>(32-k)
}

func SaturatingAddInt8(a, b int8) int8 {
	s := int(a) + int(b)
	return int8(max(math.MinInt8, min(math.MaxInt8, s)))
}

func main() {
	var x int32 = math.MaxInt32
	x++
	fmt.Println("MaxInt32 + 1 wraps to", x)
}
