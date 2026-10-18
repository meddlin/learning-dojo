# Integers, overflow and wraparound

## Concept

Go's integer types have fixed sizes: `int8`, `int16`, `int32`, `int64` and their unsigned twins (`uint8`... `uint64`). Plain `int` and `uint` are 64 bits on a modern machine. The limits live in package `math`: `math.MaxInt32`, `math.MinInt32`, `math.MaxUint32`, and so on.

What happens at the edges is where Go differs from C and C++:

- Integer overflow **wraps around** modulo 2^N, for signed and unsigned types alike. It is *defined behaviour*: no crash, no warning, no undefined behaviour. `math.MaxInt32 + 1` on an `int32` is `math.MinInt32`.
- Shifting by an amount greater than or equal to the type's width is also defined: the result is `0` (or all sign bits for a right shift of a negative signed value).
- Converting to a smaller type **truncates**: `int8(200)` is `-56`.
- Dividing by zero panics at run time, and `math.MinInt32 / -1` quietly gives `math.MinInt32`.

"Defined" is not "safe". A wrapped total is still a wrong total, and `-x` is not always positive. The fix is to widen before you compute, or to check before you add:

```go
var a, b int32 = math.MaxInt32, 1
s := a + b                       // -2147483648: wrapped, silently
w := int64(a) + int64(b)         // 2147483648: widened first, exact
```

Constants are different: they are *untyped* and exact. `var x int8 = 200` is a compile error, not a wrap.

## Your task

Implement in `solution.go`:

1. `AddOverflows(a, b int32) bool`: true if `a + b` would not fit in an `int32`.
2. `DigitSum(n int32) int`: the sum of the decimal digits of `n`, ignoring its sign. `DigitSum(-482)` is `14`. It must work for `math.MinInt32` too.
3. `RotateLeft(x uint32, k uint) uint32`: rotate the bits of `x` left by `k` positions; bits shifted out on the left re-enter on the right. `k` can be any value, including `0` and numbers above 31.
4. `SaturatingAddInt8(a, b int8) int8`: the sum, but clamped to `-128..127` instead of wrapping.
