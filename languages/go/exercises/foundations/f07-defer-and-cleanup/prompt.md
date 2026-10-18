# Cleanup with defer

## Concept

C++ has RAII: a destructor releases a resource when the object leaves scope, even if an exception flies past. Go has no destructors, but it has **`defer`**: a call scheduled to run when the surrounding function returns, *however* it returns: normal return, early return on an error, or panic.

```go
func readConfig(path string) (data []byte, err error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()        // runs on every path below
	return io.ReadAll(f)
}
```

The pattern is always the same: **acquire, check the error, `defer` the release on the very next line.** Rules to know:

- Deferred calls run **last in, first out**, and their arguments are evaluated at the `defer` statement, not when they run.
- A deferred function literal can read and change the function's **named results**, which is how you report a failure from `Close` without losing an earlier error: `defer func() { if cerr := f.Close(); cerr != nil && err == nil { err = cerr } }()`.
- During a panic, deferred calls still run. A deferred function can call `recover()` to stop the panic. To clean up and let the panic continue, `recover()`, clean, then `panic(p)` again.
- `sync.Locker` is the small interface (`Lock`, `Unlock`) implemented by `*sync.Mutex`: `mu.Lock(); defer mu.Unlock()` is the idiom everywhere.
- `io.EOF` is the sentinel a reader returns when the input is simply finished: it is not a failure.
- `errors.Join(a, b)` (Go 1.20+) combines several errors into one; `errors.Is` finds each of them.

## Your task

The interfaces `Source`, `Sink` and `Tx` are provided. Implement in `solution.go`:

1. `Copy(dst Sink, src Source) error`: repeatedly `src.Read()` and `dst.Write(chunk)` until `Read` returns `io.EOF`. **Both** `dst` and `src` must be closed exactly once on every path (success, read error, write error). The result is the first error that happened, in this order: read or write error, then the error from closing `dst`, then the error from closing `src`. An `io.EOF` is not an error.
2. `Locked(mu sync.Locker, f func())`: run `f` while holding `mu`; the lock must be released even if `f` panics (the panic still propagates).
3. `RunInTx(tx Tx, work func() error) error`: run `work`. If it returns nil, `Commit` and return its error. If it returns an error, `Rollback` (not `Commit`) and return that error, joined with the rollback's error if the rollback fails as well. If `work` panics, `Rollback` and let the panic continue.
