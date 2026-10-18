package main

import "fmt"

// FizzBuzz returns, for 1..n: "FizzBuzz" if divisible by 15, "Fizz" if by 3,
// "Buzz" if by 5, otherwise the number as text.
func FizzBuzz(n int) []string {
	return nil // TODO
}

// CollatzSteps counts the steps from n (>= 1) to 1: halve if even, otherwise
// triple and add one. CollatzSteps(1) == 0, CollatzSteps(6) == 8.
func CollatzSteps(n int) int {
	return -1 // TODO
}

// Classify returns "negative", "zero", "small" (1-9) or "large" (10 or more).
func Classify(n int) string {
	return "" // TODO
}

// SumUntilNegative adds the numbers before the first negative one.
func SumUntilNegative(xs []int) int {
	return -1 // TODO
}

// PrimesUpTo returns all primes <= n in ascending order (trial division).
func PrimesUpTo(n int) []int {
	return nil // TODO
}

func main() {
	fmt.Println(FizzBuzz(15))
}
