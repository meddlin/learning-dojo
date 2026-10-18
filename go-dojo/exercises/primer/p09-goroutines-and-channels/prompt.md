# Goroutines, channels and select

## Concept

A **goroutine** is a function running concurrently, started with the `go` keyword. They are cheap (a few KB each), so Go programs routinely run thousands.

```go
go doWork()                      // returns immediately; doWork runs concurrently
go func() { fmt.Println("hi") }()
```

Goroutines communicate with **channels**, typed pipes: `ch := make(chan int)`. `ch <- 5` sends and `v := <-ch` receives. An **unbuffered** channel makes sender and receiver meet (each blocks until the other arrives); a **buffered** one (`make(chan int, 10)`) lets senders run ahead until the buffer is full. `close(ch)` says "no more values"; receivers then drain what is left and `for v := range ch` ends. Only the sender should close, and never twice.

```go
func producer(n int) <-chan int {    // <-chan: receive-only from the caller's side
	ch := make(chan int)
	go func() {
		defer close(ch)
		for i := range n {
			ch <- i
		}
	}()
	return ch
}

for v := range producer(3) { fmt.Println(v) }   // 0 1 2
```

To wait for goroutines that do not report through a channel, use `sync.WaitGroup`: `wg.Add(1)` before starting each, `defer wg.Done()` inside, `wg.Wait()` to block until all are done.

`select` waits on several channel operations at once and runs whichever is ready first. `time.After(d)` gives a channel that delivers after `d`, which makes timeouts easy.

Three things that go wrong: **forgetting to close** (a `range` over the channel waits forever), **deadlock** (everyone is blocked: Go reports `all goroutines are asleep` and exits), and **data races** (two goroutines touching the same variable, at least one writing, with no synchronisation). The tests run with Go's race detector when your machine has it.

## Your task

Implement in `solution.go`:

1. `Generate(nums ...int) <-chan int`: returns immediately with a channel; a goroutine sends each number in order and then closes the channel.
2. `Collect(ch <-chan int) []int`: receive everything until the channel is closed.
3. `ParallelSum(nums []int, parts int) int`: split `nums` into at most `parts` consecutive chunks, sum each chunk in its own goroutine, and return the total. (`parts <= 0` should behave like 1.)
4. `FirstOf(a, b <-chan string, timeout time.Duration) (string, bool)`: the first value to arrive on either channel, or `("", false)` if nothing arrives within `timeout`.
