package main

import (
	"fmt"
	"strconv"
)

func FizzBuzz(n int) []string {
	var out []string
	for i := 1; i <= n; i++ {
		switch {
		case i%15 == 0:
			out = append(out, "FizzBuzz")
		case i%3 == 0:
			out = append(out, "Fizz")
		case i%5 == 0:
			out = append(out, "Buzz")
		default:
			out = append(out, strconv.Itoa(i))
		}
	}
	return out
}

func CollatzSteps(n int) int {
	steps := 0
	for n != 1 {
		if n%2 == 0 {
			n /= 2
		} else {
			n = 3*n + 1
		}
		steps++
	}
	return steps
}

func Classify(n int) string {
	switch {
	case n < 0:
		return "negative"
	case n == 0:
		return "zero"
	case n < 10:
		return "small"
	default:
		return "large"
	}
}

func SumUntilNegative(xs []int) int {
	sum := 0
	for _, x := range xs {
		if x < 0 {
			break
		}
		sum += x
	}
	return sum
}

func PrimesUpTo(n int) []int {
	var primes []int
outer:
	for c := 2; c <= n; c++ {
		for d := 2; d*d <= c; d++ {
			if c%d == 0 {
				continue outer
			}
		}
		primes = append(primes, c)
	}
	return primes
}

func main() {
	fmt.Println(FizzBuzz(15))
}
