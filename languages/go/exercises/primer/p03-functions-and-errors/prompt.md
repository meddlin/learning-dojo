# Functions, errors and defer

## Concept

Functions can return **several values**, and Go uses that for error handling. There are no exceptions for ordinary failures: a function that can fail returns an `error` as its last result, and the caller checks it.

```go
func Atoi(s string) (int, error)       // the standard library's own shape

n, err := strconv.Atoi("12x")
if err != nil {
	return fmt.Errorf("reading count: %w", err) // add context, keep the cause
}
```

- `error` is a tiny built-in interface. `errors.New("boom")` makes one. A package-level `var ErrNotFound = errors.New("not found")` is a **sentinel**: callers compare with `errors.Is(err, ErrNotFound)`.
- `fmt.Errorf("...: %w", err)` **wraps** an error. `errors.Is` and `errors.As` look through the wrapping, so adding context never hides the cause. `errors.As(err, &target)` finds an error of a given *type* (for example `*strconv.NumError`).
- **Variadic** functions take any number of trailing arguments: `func Sum(xs ...int) int`. Inside, `xs` is a `[]int`; pass an existing slice with `Sum(nums...)`.
- **Named results** (`func f() (n int, err error)`) are variables you can assign to, which matters for `defer`.
- **`defer`** schedules a call for when the surrounding function returns, whichever way it returns. Deferred calls run **last in, first out**. It is how Go does cleanup (`defer file.Close()`, `defer mu.Unlock()`).
- **`panic`** is for programmer errors (index out of range, nil pointer). `recover()`, called inside a deferred function, catches a panic. Use it sparingly, at boundaries such as "a failing request must not kill the server".

```go
func safe(f func()) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("recovered: %v", r) // assign to the named result
		}
	}()
	f()
	return nil
}
```

## Your task

The sentinel errors `ErrDivideByZero`, `ErrEmpty` and `ErrNotPositive` are provided. Implement in `solution.go`:

1. `Divide(a, b int) (int, error)`: integer division, or `ErrDivideByZero` if `b` is 0.
2. `MinMax(xs ...int) (lo, hi int, err error)`: the smallest and largest argument, or `ErrEmpty` if there are none.
3. `ParsePositive(s string) (int, error)`: parse a positive integer. A string that is not a number gives an error that wraps the original (so `errors.As` can find a `*strconv.NumError`) and mentions the input text. A number `<= 0` gives an error that wraps `ErrNotPositive` and mentions the input text.
4. `Try(f func()) (err error)`: run `f`; if it panics, return an error whose text contains the panic value instead of crashing. If it does not panic, return nil.
5. `DeferOrder() (steps []string)`: using `defer`, return exactly `["work", "third", "second", "first"]`: append `"work"` in the function body and register three deferred appends so they run after it, last registered first.
