# Control flow: for, if, switch

## Concept

Go has exactly one loop keyword, `for`, in four shapes:

```go
for i := 0; i < 3; i++ { ... }    // classic three-part loop
for n > 1 { ... }                  // "while": just a condition
for { ... }                        // forever (use break/return to leave)
for i, v := range xs { ... }       // over a slice: index and value
for i := range 3 { ... }           // over an int: 0, 1, 2   (Go 1.22+)
```

`range` also walks maps (key, value), strings (byte position, rune), and channels. Use `_` to ignore a value you do not need: `for _, v := range xs`.

`if` can run a short statement first, whose variables live only in the `if` and its `else` branches. No parentheses around conditions, but braces are mandatory:

```go
if v, err := strconv.Atoi(s); err != nil {
	return err
} else if v < 0 {
	return fmt.Errorf("negative: %d", v)
}
```

`switch` is tidier than in C: no `break` needed (cases do **not** fall through), cases can be expressions, and a `switch` with no tag is a clean if/else chain:

```go
switch {
case n < 0:
	return "negative"
case n == 0:
	return "zero"
default:
	return "positive"
}
```

`break` and `continue` work as usual, and a **label** lets them target an outer loop: `outer:` before the loop, then `continue outer` or `break outer` from inside.

## Your task

Implement in `solution.go`:

1. `FizzBuzz(n int) []string`: for `1..n`: `"FizzBuzz"` if divisible by 15, `"Fizz"` if by 3, `"Buzz"` if by 5, otherwise the number as text. `FizzBuzz(0)` is empty.
2. `CollatzSteps(n int) int`: for `n >= 1`, how many steps until you reach 1, where a step is "halve if even, otherwise triple and add one". `CollatzSteps(1)` is `0`, `CollatzSteps(6)` is `8`.
3. `Classify(n int) string`: `"negative"`, `"zero"`, `"small"` (1 to 9) or `"large"` (10 or more). Use a tagless `switch`.
4. `SumUntilNegative(xs []int) int`: add up the numbers before the first negative one (all of them if there is none).
5. `PrimesUpTo(n int) []int`: all primes `<= n`, ascending, found by trial division with a labeled `continue`.
