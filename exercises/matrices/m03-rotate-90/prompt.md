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

## Your task

Using `Matrix = std::vector<std::vector<int>>`, implement in `solution.cpp`:

1. `Matrix rotate_cw(const Matrix& m)`: a new matrix rotated 90 degrees clockwise. Works for any rectangle. An empty input gives an empty result.
2. `Matrix rotate_ccw(const Matrix& m)`: counter-clockwise.
3. `Matrix rotate_180(const Matrix& m)`.
4. `void rotate_in_place(Matrix& m)`: rotate a **square** `n x n` matrix clockwise without allocating another matrix (swaps and `std::reverse` only).
