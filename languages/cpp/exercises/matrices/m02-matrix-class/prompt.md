# A Matrix class with flat storage

## Concept

`vector<vector<double>>` is easy but each row is a separate heap allocation, and rows may sit far apart in memory. Numeric code (graphics, linear algebra, image processing) usually stores a matrix in **one contiguous array** in **row-major order**:

```
2 x 3 matrix            memory:  [ a b c d e f ]
  a b c                          row 0 ---^^^
  d e f                          row 1 -------^^^
```

Cell `(r, c)` lives at `data[r * cols + c]`. This is exactly how a C array `double a[2][3]` is laid out, and why walking a matrix **row by row** is fast (it follows memory order) while walking column by column jumps around.

Wrapping the array in a class gives you a safe interface and lets you write `m(r, c)` instead of index arithmetic everywhere. Since C++23 you could write `m[r, c]`; `operator()` works in every version:

```cpp
class Matrix {
public:
    double&       operator()(int r, int c)       { return data_[r * cols_ + c]; }
    const double& operator()(int r, int c) const { return data_[r * cols_ + c]; }
    ...
};
```

Why two versions? A `const Matrix&` may only call `const` member functions. The first overload lets you *assign* (`m(1, 2) = 5.0`), the second lets you *read* from a const matrix.

You will reuse this class idea for the transformation matrices later in this track.

## Your task

Implement the class `Matrix` in `solution.cpp`:

- `Matrix(int rows, int cols, double fill = 0.0)`
- `int rows() const`, `int cols() const`
- `double& operator()(int r, int c)` and `const double& operator()(int r, int c) const`
- `const double* data() const`: pointer to the first element of the flat row-major storage
- `Matrix transposed() const`: a new transposed matrix
- `static Matrix identity(int n)`: the `n x n` identity matrix (ones on the diagonal, zeros elsewhere)
- `bool operator==(const Matrix& other) const`: same shape and same values
