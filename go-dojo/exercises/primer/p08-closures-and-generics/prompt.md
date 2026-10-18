# Closures and generics

## Concept

Functions are **values**: you can store them in variables, pass them as arguments and return them. A function literal that uses variables from the code around it is a **closure**, and it keeps those variables alive and shared:

```go
func Counter() func() int {
	n := 0
	return func() int { // captures n
		n++
		return n
	}
}

next := Counter()
next() // 1
next() // 2
other := Counter()
other() // 1  (its own n)
```

**Loop variables.** Since Go 1.22 a `for` loop creates a fresh variable per iteration, so closures created in a loop capture different values. (Before 1.22 they all shared one variable, a famous source of bugs. This dojo requires Go 1.22+.)

**Generics** (Go 1.18+) let one function work on many types. A function declares **type parameters** in square brackets, each with a **constraint** saying what the type must support:

```go
func Map[T, U any](xs []T, f func(T) U) []U {
	out := make([]U, 0, len(xs))
	for _, x := range xs {
		out = append(out, f(x))
	}
	return out
}

squares := Map([]int{1, 2, 3}, func(n int) int { return n * n })   // T and U inferred
lengths := Map([]string{"a", "bb"}, func(s string) int { return len(s) })

func Max[T cmp.Ordered](a, b T) T { if a > b { return a }; return b }
```

`any` means "any type"; `comparable` means "supports `==` (usable as a map key)"; `cmp.Ordered` (package `cmp`) means "supports `<`, `>`": all integer, float and string types. The standard library's `slices` and `maps` packages are built from exactly these tools.

## Your task

Implement in `solution.go`:

1. `Counter() func() int`: each call to the returned function gives 1, then 2, then 3... Every `Counter()` has its own count.
2. `MakeAdders(n int) []func(int) int`: `n` functions where the one at index `i` adds `i` to its argument.
3. `Map[T, U any](xs []T, f func(T) U) []U`
4. `Filter[T any](xs []T, keep func(T) bool) []T`
5. `Reduce[T, A any](xs []T, init A, f func(A, T) A) A`: fold from the left, starting with `init`.
6. `MaxOf[T cmp.Ordered](xs ...T) (T, bool)`: the largest argument, or the zero value and `false` if there are none.
