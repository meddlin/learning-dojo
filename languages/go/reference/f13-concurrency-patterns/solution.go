package main

import (
	"context"
	"fmt"
	"sync"
)

type SafeCounter struct {
	mu     sync.Mutex
	counts map[string]int
}

func NewSafeCounter() *SafeCounter {
	return &SafeCounter{counts: make(map[string]int)}
}

func (c *SafeCounter) Inc(key string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.counts[key]++
}

func (c *SafeCounter) Get(key string) int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.counts[key]
}

func MapParallel[T, R any](in []T, workers int, f func(T) R) []R {
	out := make([]R, len(in))
	if workers <= 0 {
		workers = 1
	}
	jobs := make(chan int)
	var wg sync.WaitGroup
	for range min(workers, len(in)) {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range jobs {
				out[i] = f(in[i])
			}
		}()
	}
	for i := range in {
		jobs <- i
	}
	close(jobs)
	wg.Wait()
	return out
}

func Square(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			out <- v * v
		}
	}()
	return out
}

func Evens(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for v := range in {
			if v%2 == 0 {
				out <- v
			}
		}
	}()
	return out
}

func Sum(in <-chan int) int {
	total := 0
	for v := range in {
		total += v
	}
	return total
}

func Count(ctx context.Context) <-chan int {
	out := make(chan int)
	go func() {
		defer close(out)
		for i := 0; ; i++ {
			select {
			case out <- i:
			case <-ctx.Done():
				return
			}
		}
	}()
	return out
}

func FanIn(chans ...<-chan int) <-chan int {
	out := make(chan int)
	var wg sync.WaitGroup
	for _, c := range chans {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for v := range c {
				out <- v
			}
		}()
	}
	go func() {
		wg.Wait()
		close(out)
	}()
	return out
}

func main() {
	c := NewSafeCounter()
	c.Inc("go")
	fmt.Println(c.Get("go"))
}
