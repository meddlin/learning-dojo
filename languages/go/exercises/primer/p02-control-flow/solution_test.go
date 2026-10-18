package main

import "testing"

func TestFizzBuzzUpTo15(t *testing.T) {
	want := []string{"1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"}
	Equal(t, FizzBuzz(15), want)
}

func TestFizzBuzzOfNothing(t *testing.T) {
	Equal(t, len(FizzBuzz(0)), 0)
	Equal(t, FizzBuzz(1), []string{"1"})
}

func TestCollatzSteps(t *testing.T) {
	Equal(t, CollatzSteps(1), 0)
	Equal(t, CollatzSteps(2), 1)
	Equal(t, CollatzSteps(6), 8)
	Equal(t, CollatzSteps(27), 111)
}

func TestClassify(t *testing.T) {
	Equal(t, Classify(-5), "negative")
	Equal(t, Classify(0), "zero")
	Equal(t, Classify(1), "small")
	Equal(t, Classify(9), "small")
	Equal(t, Classify(10), "large")
	Equal(t, Classify(1000), "large")
}

func TestSumUntilNegative(t *testing.T) {
	Equal(t, SumUntilNegative([]int{1, 2, 3, -1, 10}), 6)
	Equal(t, SumUntilNegative([]int{4, 5}), 9)
	Equal(t, SumUntilNegative(nil), 0)
	Equal(t, SumUntilNegative([]int{-1, 5, 5}), 0)
}

func TestPrimesUpTo(t *testing.T) {
	Equal(t, PrimesUpTo(30), []int{2, 3, 5, 7, 11, 13, 17, 19, 23, 29})
	Equal(t, PrimesUpTo(2), []int{2})
	Equal(t, len(PrimesUpTo(1)), 0)
	Equal(t, len(PrimesUpTo(100)), 25)
}
