package main

import (
	"fmt"
	"time"
)

// Generate returns a channel immediately; a goroutine sends nums in order and
// then closes the channel.
func Generate(nums ...int) <-chan int {
	ch := make(chan int)
	close(ch) // TODO: send the numbers from a goroutine, then close
	return ch
}

// Collect receives values until ch is closed and returns them.
func Collect(ch <-chan int) []int {
	return nil // TODO
}

// ParallelSum splits nums into at most `parts` consecutive chunks, sums each in
// its own goroutine, and returns the total. parts <= 0 behaves like 1.
func ParallelSum(nums []int, parts int) int {
	return -1 // TODO
}

// FirstOf returns the first value to arrive on a or b, or ("", false) if
// nothing arrives within timeout.
func FirstOf(a, b <-chan string, timeout time.Duration) (string, bool) {
	return "", false // TODO
}

func main() {
	fmt.Println(Collect(Generate(1, 2, 3)))
}
