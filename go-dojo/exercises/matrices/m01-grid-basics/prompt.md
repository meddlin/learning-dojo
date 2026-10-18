# Grids as slices of slices

## Concept

The simplest way to hold a matrix in Go is a slice of row slices:

```go
type Matrix [][]int

m := Matrix{{1, 2, 3},
	{4, 5, 6}} // 2 rows, 3 columns
len(m)         // 2   (rows)
len(m[0])      // 3   (columns)
m[1][2]        // 6   (row 1, column 2)
```

Three habits prevent most bugs:

1. **Row first, column second**: `m[r][c]`. Name your loop variables `r` and `c`, never `i` and `j`, until it is automatic.
2. **Check for empty input** before reading `m[0]`. Go checks every index at run time: `m[0]` on an empty matrix panics with `index out of range [0] with length 0`.
3. **Allocate every row.** There is no `Matrix(rows, cols)` constructor. `make([][]int, rows)` gives you `rows` *nil* rows; each one needs its own `make([]int, cols)`:

```go
m := make(Matrix, rows)
for r := range m {
	m[r] = make([]int, cols) // zero-filled
}
```

Writing `row := make([]int, cols)` once and storing the *same* `row` in every position gives you rows that share memory: change one cell and you change a whole column. The tests check for that bug.

You will do this kind of nested-loop work in every graph-grid and image problem from here on.

## Your task

Implement in `solution.go`:

1. `MakeMatrix(rows, cols, fill int) Matrix`: a `rows x cols` matrix with every cell equal to `fill`.
2. `Transpose(m Matrix) Matrix`: swap rows and columns, so the result of an `r x c` matrix is `c x r`. An empty matrix gives an empty matrix.
3. `RowSums(m Matrix) []int` and `ColSums(m Matrix) []int`.
4. `IsSymmetric(m Matrix) bool`: true if `m` is square and equals its own transpose (an empty matrix counts as symmetric).

All matrices passed to your functions are rectangular (every row has the same length).
