# Values, types and fmt

## Concept

Every Go file starts with `package main` (for a program) and a list of imports. Execution begins at `func main()`. This dojo gives you a file with a `main` as a scratch area (press **Run**) and tests for the other functions (press **Run tests**).

```go
package main

import "fmt"

const Pi = 3.14159 // constants are untyped until used

func main() {
	var count int = 3     // explicit type
	var ratio float64     // no value given: the ZERO VALUE, 0.0
	name := "gopher"      // := declares and infers the type (only inside functions)
	count++               // statements need no semicolons
	fmt.Println(name, count, ratio)
}
```

Things to notice:

- **Zero values.** A variable you declare without a value is never garbage: numbers are `0`, strings are `""`, booleans `false`, and pointers, slices, maps, channels, functions and interfaces are `nil`. Much Go code relies on this.
- **Explicit conversions only.** `float64(n)` converts, and there is no implicit widening: `x := 3; y := 2.5; x * y` does not compile. This removes a whole family of C-style surprises.
- **Types you will meet:** `int` (64 bits on modern machines), `int8`..`int64`, `uint8`..`uint64`, `float64`, `bool`, `string`, `byte` (alias for `uint8`), `rune` (alias for `int32`, one Unicode character).
- **Unused variables and imports are compile errors.** Annoying for a day, then a gift.
- **fmt verbs.** `fmt.Sprintf` builds a string, `fmt.Println` prints one. Handy verbs: `%d` integer, `%s` string, `%q` quoted string, `%v` any value in default format, `%+v` structs with field names, `%T` the type, `%x` hex, `%b` binary, `%.2f` float with 2 decimals.

## Your task

Implement in `solution.go`:

1. `Greeting(name string) string`: `"Hello, <name>!"`, or `"Hello, world!"` when `name` is empty.
2. `Average(a, b int) float64`: the mean of two ints, as a float (`Average(7, 8)` is `7.5`).
3. `Describe(n int) string`: `n` in three bases, `Describe(42)` is `"42 = 0x2a = 0b101010"`. Use `fmt.Sprintf`.
4. `ZeroValues() string`: declare, **without giving them values**, an `int`, a `string`, a `bool`, a `[]int`, a `map[string]int` and a `*int`, and return `fmt.Sprintf("%v %q %v %v %v %v", i, s, b, sl, m, p)`. The output shows what each zero value looks like.
