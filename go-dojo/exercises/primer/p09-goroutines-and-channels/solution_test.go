package main

import (
	"testing"
	"time"
)

func TestGenerateSendsInOrderThenCloses(t *testing.T) {
	ch := Generate(1, 2, 3)
	Equal(t, <-ch, 1)
	Equal(t, <-ch, 2)
	Equal(t, <-ch, 3)
	_, open := <-ch
	False(t, open, "the channel should be closed after the last value")
}

func TestGenerateReturnsWithoutWaitingForAReceiver(t *testing.T) {
	done := make(chan struct{})
	go func() {
		Generate(1, 2, 3, 4, 5) // nobody reads: must not block the caller
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("Generate blocked: it should start a goroutine to do the sending")
	}
}

func TestGenerateOfNothingIsAClosedChannel(t *testing.T) {
	_, open := <-Generate()
	False(t, open)
}

func TestCollectGathersEverything(t *testing.T) {
	Equal(t, Collect(Generate(4, 5, 6)), []int{4, 5, 6})
	Equal(t, len(Collect(Generate())), 0)
}

func TestCollectFromABufferedChannel(t *testing.T) {
	ch := make(chan int, 3)
	ch <- 7
	ch <- 8
	close(ch)
	Equal(t, Collect(ch), []int{7, 8})
}

func TestParallelSumMatchesTheSequentialSum(t *testing.T) {
	nums := make([]int, 1000)
	want := 0
	for i := range nums {
		nums[i] = i + 1
		want += nums[i]
	}
	for _, parts := range []int{1, 2, 3, 7, 10, 1000, 5000} {
		Equal(t, ParallelSum(nums, parts), want, "parts = %d", parts)
	}
}

func TestParallelSumEdgeCases(t *testing.T) {
	Equal(t, ParallelSum(nil, 4), 0)
	Equal(t, ParallelSum([]int{5}, 4), 5)
	Equal(t, ParallelSum([]int{1, 2, 3}, 0), 6)
	Equal(t, ParallelSum([]int{1, 2, 3}, -2), 6)
}

func TestFirstOfTakesWhicheverArrives(t *testing.T) {
	a, b := make(chan string), make(chan string)
	go func() {
		time.Sleep(10 * time.Millisecond)
		a <- "from a"
	}()
	v, ok := FirstOf(a, b, 2*time.Second)
	True(t, ok)
	Equal(t, v, "from a")
	go func() { b <- "from b" }()
	v, ok = FirstOf(a, b, 2*time.Second)
	True(t, ok)
	Equal(t, v, "from b")
}

func TestFirstOfTimesOut(t *testing.T) {
	a, b := make(chan string), make(chan string)
	start := time.Now()
	v, ok := FirstOf(a, b, 30*time.Millisecond)
	False(t, ok)
	Equal(t, v, "")
	True(t, time.Since(start) < 2*time.Second, "FirstOf should give up after the timeout")
}
