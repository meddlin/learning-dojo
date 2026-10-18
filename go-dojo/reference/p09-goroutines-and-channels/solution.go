package main

import (
	"fmt"
	"sync"
	"time"
)

func Generate(nums ...int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for _, n := range nums {
			ch <- n
		}
	}()
	return ch
}

func Collect(ch <-chan int) []int {
	var out []int
	for v := range ch {
		out = append(out, v)
	}
	return out
}

func ParallelSum(nums []int, parts int) int {
	if parts <= 0 {
		parts = 1
	}
	if len(nums) == 0 {
		return 0
	}
	size := (len(nums) + parts - 1) / parts
	var chunks [][]int
	for start := 0; start < len(nums); start += size {
		chunks = append(chunks, nums[start:min(start+size, len(nums))])
	}
	sums := make([]int, len(chunks))
	var wg sync.WaitGroup
	for i, chunk := range chunks {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for _, n := range chunk {
				sums[i] += n
			}
		}()
	}
	wg.Wait()
	total := 0
	for _, s := range sums {
		total += s
	}
	return total
}

func FirstOf(a, b <-chan string, timeout time.Duration) (string, bool) {
	select {
	case v := <-a:
		return v, true
	case v := <-b:
		return v, true
	case <-time.After(timeout):
		return "", false
	}
}

func main() {
	fmt.Println(Collect(Generate(1, 2, 3)))
}
