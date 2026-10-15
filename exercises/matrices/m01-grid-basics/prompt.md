# Grids as vectors of vectors

## Concept

The simplest way to hold a matrix in C++ is a vector of row vectors:

```cpp
using Matrix = std::vector<std::vector<int>>;
Matrix m = {{1, 2, 3},
            {4, 5, 6}};          // 2 rows, 3 columns
m.size();                        // 2   (rows)
m[0].size();                     // 3   (columns)
m[1][2];                         // 6   (row 1, column 2)
```

Two habits prevent most bugs:

1. **Row first, column second**: `m[r][c]`. Name your loop variables `r` and `c`, never `i` and `j`, until it is automatic.
2. **Check for empty input** before reading `m[0]`. Indexing the first row of an empty matrix is undefined behaviour (the sanitizers will shout at you).

To create a matrix of a given size: `Matrix m(rows, std::vector<int>(cols, fill));`. That reads as "`rows` copies of a row of `cols` copies of `fill`".

You will do this kind of nested-loop work in every graph-grid and image problem from here on.

## Your task

Implement in `solution.cpp`:

1. `Matrix make_matrix(int rows, int cols, int fill)`: a `rows x cols` matrix with every cell equal to `fill`.
2. `Matrix transpose(const Matrix& m)`: swap rows and columns, so the result of an `r x c` matrix is `c x r`. An empty matrix gives an empty matrix.
3. `std::vector<int> row_sums(const Matrix& m)` and `std::vector<int> col_sums(const Matrix& m)`.
4. `bool is_symmetric(const Matrix& m)`: true if `m` is square and equals its own transpose (an empty matrix counts as symmetric).

All matrices passed to your functions are rectangular (every row has the same length).
