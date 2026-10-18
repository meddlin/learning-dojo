# Concurrency patterns

## Concept

You met goroutines and channels in the primer. Real concurrent programs add three concerns: **protecting shared state**, **bounding the work**, and **shutting down cleanly**.

**Shared state and the race detector.** If two goroutines touch the same variable and at least one writes, you have a *data race*, with undefined results. Protect shared data with a `sync.Mutex` (`Lock`, then `defer Unlock`), or avoid sharing by passing values over channels ("share memory by communicating"). Go can find races for you: build with `-race` and it reports `WARNING: DATA RACE` with both stack traces. This dojo's chip in the top bar says whether the race detector is on; with it, a missing lock fails a test.

```go
type SafeCounter struct {
	mu sync.Mutex
	n  map[string]int
}
func (c *SafeCounter) Inc(k string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.n[k]++
}
```

**Worker pool.** Spawning a goroutine per item is cheap but unbounded. A fixed number of workers pulling jobs from a channel bounds the concurrency: `jobs := make(chan Job)`, N workers doing `for j := range jobs`, a `WaitGroup` to know when they are done. Writing results into distinct slice indexes avoids needing a lock.

**Pipelines.** Chain stages with channels: `gen -> square -> filter -> sum`. Each stage owns its output channel: it creates it, sends on it, and **closes** it when its input is exhausted. Rule of thumb: *only the sender closes, and exactly once.* A `for v := range in` loop ends precisely because the upstream stage closed `in`.

**Fan-in** merges several channels into one. The merged channel must be closed only after *every* forwarder has finished, which is what a `WaitGroup` plus one "waiter" goroutine is for.

**Cancellation.** A goroutine blocked forever on a send or receive is a **leak**. Any loop that sends to a consumer should also listen for cancellation: `select { case out <- v: case <-ctx.Done(): return }`. `context.Context` carries the signal: the owner calls `cancel()`, and every goroutine selecting on `ctx.Done()` winds down.

## Your task

Implement in `solution.go`:

1. `SafeCounter`: `NewSafeCounter() *SafeCounter`, `Inc(key string)` and `Get(key string) int`, safe for use from many goroutines.
2. `MapParallel[T, R any](in []T, workers int, f func(T) R) []R`: apply `f` to every element using at most `workers` goroutines at a time (`workers <= 0` means 1), returning the results **in input order**.
3. `Square(in <-chan int) <-chan int` and `Evens(in <-chan int) <-chan int` (only the even numbers): pipeline stages that close their output when `in` is closed. And `Sum(in <-chan int) int`, which drains a channel and adds everything up.
4. `Count(ctx context.Context) <-chan int`: sends `0, 1, 2, ...` until `ctx` is cancelled, then closes the channel and lets its goroutine exit.
5. `FanIn(chans ...<-chan int) <-chan int`: every value from every input, in any order; the result is closed once all inputs are closed (immediately if there are none).
