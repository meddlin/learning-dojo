# Rotating a matrix 90 degrees

## Concept

Rotation is just a rule for moving cells. For an `R x C` matrix rotated **clockwise** by 90 degrees, the result has `C` rows and `R` columns, and

```
new[c][R - 1 - r] = old[r][c]
```

```
1 2 3        4 1
4 5 6   -->  5 2
             6 3
```

The old first row `1 2 3` became the last column, read top to bottom.

A famous interview variation asks you to rotate a **square** matrix *in place*, with no second matrix. The trick is to see rotation as two simpler moves:

1. **Transpose** (reflect across the main diagonal).
2. **Reverse each row** (mirror left-right).

```
1 2 3     1 4 7     7 4 1
4 5 6 --> 2 5 8 --> 8 5 2
7 8 9     3 6 9     9 6 3
```

Splitting a hard transformation into easy known pieces is a general habit worth building. It reappears in the next exercises where rotation, scaling and translation get composed.

Go makes the swap pleasant: `a, b = b, a` evaluates the right side first, so it needs no temporary variable. And a `[][]int` passed to a function is a slice header pointing at the *caller's* rows, so `RotateInPlace(m Matrix)` can change `m`'s cells without returning anything. (It could not replace `m` itself with a bigger one, which is why only the **square** case works in place.)

## Your task

Using `Matrix = [][]int`, implement in `solution.go`:

1. `RotateCW(m Matrix) Matrix`: a new matrix rotated 90 degrees clockwise. Works for any rectangle. An empty input gives an empty result.
2. `RotateCCW(m Matrix) Matrix`: counter-clockwise.
3. `Rotate180(m Matrix) Matrix`.
4. `RotateInPlace(m Matrix)`: rotate a **square** `n x n` matrix clockwise without allocating another matrix (swaps and `slices.Reverse` only).

The first three must not change `m`.
