package main

import (
	"context"
	"slices"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func chkFeed(nums ...int) <-chan int {
	ch := make(chan int)
	go func() {
		defer close(ch)
		for _, n := range nums {
			ch <- n
		}
	}()
	return ch
}

func chkDrain(t *testing.T, ch <-chan int) []int {
	t.Helper()
	deadline := time.After(3 * time.Second)
	var out []int
	for {
		select {
		case v, ok := <-ch:
			if !ok {
				return out
			}
			out = append(out, v)
		case <-deadline:
			t.Fatalf("the channel was not closed within 3 seconds (received %v so far): who is supposed to close it?", out)
		}
	}
}

func TestSafeCounterCountsPerKey(t *testing.T) {
	c := NewSafeCounter()
	c.Inc("a")
	c.Inc("a")
	c.Inc("b")
	Equal(t, c.Get("a"), 2)
	Equal(t, c.Get("b"), 1)
	Equal(t, c.Get("never"), 0)
}

func TestSafeCounterSurvivesManyGoroutines(t *testing.T) {
	c := NewSafeCounter()
	var wg sync.WaitGroup
	for range 50 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for range 200 {
				c.Inc("a")
				c.Inc("b")
			}
		}()
	}
	wg.Wait()
	Equal(t, c.Get("a"), 10000)
	Equal(t, c.Get("b"), 10000)
}

func TestMapParallelKeepsInputOrder(t *testing.T) {
	in := make([]int, 100)
	want := make([]int, 100)
	for i := range in {
		in[i] = i
		want[i] = i * i
	}
	Equal(t, MapParallel(in, 8, func(x int) int { return x * x }), want)
}

func TestMapParallelChangesTheType(t *testing.T) {
	got := MapParallel([]string{"go", "dojo", ""}, 2, func(s string) int { return len(s) })
	Equal(t, got, []int{2, 4, 0})
	up := MapParallel([]string{"a", "b"}, 3, strings.ToUpper)
	Equal(t, up, []string{"A", "B"})
}

func TestMapParallelEdgeCases(t *testing.T) {
	Equal(t, len(MapParallel([]int(nil), 4, func(x int) int { return x })), 0)
	Equal(t, MapParallel([]int{3, 4}, 0, func(x int) int { return x + 1 }), []int{4, 5})
	Equal(t, MapParallel([]int{3, 4}, -5, func(x int) int { return x + 1 }), []int{4, 5})
	Equal(t, MapParallel([]int{3}, 100, func(x int) int { return x + 1 }), []int{4})
}

func TestMapParallelUsesSeveralWorkersButNotMoreThanAsked(t *testing.T) {
	var cur, peak atomic.Int32
	f := func(x int) int {
		n := cur.Add(1)
		for {
			p := peak.Load()
			if n <= p || peak.CompareAndSwap(p, n) {
				break
			}
		}
		time.Sleep(15 * time.Millisecond)
		cur.Add(-1)
		return x * 2
	}
	in := make([]int, 24)
	for i := range in {
		in[i] = i
	}
	out := MapParallel(in, 4, f)
	Equal(t, out[23], 46)
	True(t, peak.Load() >= 2, "work never ran in parallel (peak concurrency %d)", peak.Load())
	True(t, peak.Load() <= 4, "more than 4 calls ran at once (peak concurrency %d)", peak.Load())
}

func TestMapParallelWithOneWorkerIsSequential(t *testing.T) {
	var cur, peak atomic.Int32
	f := func(x int) int {
		n := cur.Add(1)
		for {
			p := peak.Load()
			if n <= p || peak.CompareAndSwap(p, n) {
				break
			}
		}
		time.Sleep(2 * time.Millisecond)
		cur.Add(-1)
		return x
	}
	MapParallel([]int{1, 2, 3, 4, 5}, 1, f)
	Equal(t, peak.Load(), int32(1))
}

func TestSquare(t *testing.T) {
	Equal(t, chkDrain(t, Square(chkFeed(1, 2, 3, -4))), []int{1, 4, 9, 16})
	Equal(t, len(chkDrain(t, Square(chkFeed()))), 0)
}

func TestEvens(t *testing.T) {
	Equal(t, chkDrain(t, Evens(chkFeed(1, 2, 3, 4, 5, 6, -8, -7))), []int{2, 4, 6, -8})
	Equal(t, len(chkDrain(t, Evens(chkFeed(1, 3, 5)))), 0)
}

func TestSum(t *testing.T) {
	Equal(t, Sum(chkFeed(1, 2, 3, 4)), 10)
	Equal(t, Sum(chkFeed()), 0)
}

func TestPipelinesCompose(t *testing.T) {
	nums := make([]int, 10)
	for i := range nums {
		nums[i] = i + 1
	}
	// squares of the even numbers 1..10: 4 + 16 + 36 + 64 + 100
	Equal(t, Sum(Square(Evens(chkFeed(nums...)))), 220)
}

func TestCountStopsWhenTheContextIsCancelled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	ch := Count(ctx)
	for want := range 5 {
		select {
		case v, ok := <-ch:
			True(t, ok, "the channel closed too early")
			Equal(t, v, want)
		case <-time.After(2 * time.Second):
			t.Fatal("Count did not deliver a value")
		}
	}
	cancel()
	deadline := time.After(3 * time.Second)
	for {
		select {
		case _, ok := <-ch:
			if !ok {
				return
			}
		case <-deadline:
			t.Fatal("Count kept producing after cancel(): select on ctx.Done() when sending, and close the channel when you stop")
		}
	}
}

func TestCountDoesNotLeakItsGoroutine(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	ch := Count(ctx)
	<-ch
	cancel() // and then nobody ever reads from ch again
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		select {
		case _, ok := <-ch:
			if !ok {
				return
			}
		case <-time.After(20 * time.Millisecond):
			// Nothing to read right now; keep waiting for the close.
		}
	}
	t.Fatal("the channel was never closed after cancel(), so the goroutine is stuck")
}

func TestFanInDeliversEverythingAndCloses(t *testing.T) {
	got := chkDrain(t, FanIn(chkFeed(1, 2, 3), chkFeed(10, 20), chkFeed()))
	slices.Sort(got)
	Equal(t, got, []int{1, 2, 3, 10, 20})
}

func TestFanInOfNothingIsAClosedChannel(t *testing.T) {
	Equal(t, len(chkDrain(t, FanIn())), 0)
}

func TestFanInWithManyBusyProducers(t *testing.T) {
	var feeds []<-chan int
	want := 0
	for p := range 20 {
		nums := make([]int, 100)
		for i := range nums {
			nums[i] = p*1000 + i
			want += nums[i]
		}
		feeds = append(feeds, chkFeed(nums...))
	}
	got := chkDrain(t, FanIn(feeds...))
	Equal(t, len(got), 2000)
	total := 0
	for _, v := range got {
		total += v
	}
	Equal(t, total, want)
}
