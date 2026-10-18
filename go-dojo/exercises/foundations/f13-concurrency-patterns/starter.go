package main

import (
	"context"
	"fmt"
	"sync"
)

// SafeCounter counts occurrences per key and may be used from many goroutines.
type SafeCounter struct {
	mu     sync.Mutex
	counts map[string]int
}

// NewSafeCounter returns an empty counter.
func NewSafeCounter() *SafeCounter {
	return &SafeCounter{} // TODO
}

// Inc adds one to the count for key.
func (c *SafeCounter) Inc(key string) {
	// TODO
}

// Get returns the count for key (0 if it was never incremented).
func (c *SafeCounter) Get(key string) int {
	return -1 // TODO
}

// MapParallel applies f to every element of in using at most `workers`
// goroutines at a time (workers <= 0 means 1) and returns the results in input order.
func MapParallel[T, R any](in []T, workers int, f func(T) R) []R {
	return nil // TODO
}

// closed returns a channel that is already closed, as a placeholder for the stubs below.
func closed() <-chan int {
	ch := make(chan int)
	close(ch)
	return ch
}

// Square is a pipeline stage: it sends the square of every value from in, and
// closes its output when in is closed.
func Square(in <-chan int) <-chan int {
	return closed() // TODO
}

// Evens is a pipeline stage that passes on only the even values from in.
func Evens(in <-chan int) <-chan int {
	return closed() // TODO
}

// Sum receives from in until it is closed and returns the total.
func Sum(in <-chan int) int {
	return -1 // TODO
}

// Count sends 0, 1, 2, ... until ctx is cancelled, then closes the channel and
// lets its goroutine exit.
func Count(ctx context.Context) <-chan int {
	return closed() // TODO
}

// FanIn merges all inputs into one channel, closed once every input is closed.
func FanIn(chans ...<-chan int) <-chan int {
	return closed() // TODO
}

func main() {
	c := NewSafeCounter()
	c.Inc("go")
	fmt.Println(c.Get("go"))
}
