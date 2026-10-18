# A Matrix type with flat storage

## Concept

A slice of row slices is easy but each row is a separate heap allocation, and rows may sit far apart in memory. Numeric code (graphics, linear algebra, image processing) usually stores a matrix in **one contiguous slice** in **row-major order**:

```
2 x 3 matrix            memory:  [ a b c d e f ]
  a b c                          row 0 ---^^^
  d e f                          row 1 -------^^^
```

Cell `(r, c)` lives at `data[r*cols + c]`. Walking a matrix **row by row** is fast (it follows memory order) while walking column by column jumps around.

Wrapping the slice in a struct gives you a safe interface and lets you write `m.At(r, c)` instead of index arithmetic everywhere. Go has no operator overloading, so `At` and `Set` methods are the idiom.

```go
type Matrix struct {
	rows, cols int
	data       []float64
}

func (m *Matrix) At(r, c int) float64 { return m.data[r*m.cols+c] }
```

Two Go details this exercise is about:

- **Constructors are plain functions**, conventionally named `NewMatrix`, usually returning a pointer. There is no "default constructor": a `Matrix{}` is valid Go but has no storage, which is why constructors matter.
- **Copying a struct copies its fields, not what a slice field points at.** `b := *a` gives `b` its own `rows` and `cols`, but `b.data` and `a.data` are the *same* array. That is why this type offers `Clone`, which makes a real copy.

## Your task

Implement the type `Matrix` in `solution.go`:

- `NewMatrix(rows, cols int, fill float64) *Matrix`
- `(*Matrix).Rows() int` and `(*Matrix).Cols() int`
- `(*Matrix).At(r, c int) float64` and `(*Matrix).Set(r, c int, v float64)`
- `(*Matrix).Data() []float64`: the flat row-major storage (not a copy)
- `(*Matrix).Transposed() *Matrix`: a new transposed matrix
- `(*Matrix).Clone() *Matrix`: an independent deep copy
- `(*Matrix).Equal(o *Matrix) bool`: same shape and same values
- `Identity(n int) *Matrix`: the `n x n` identity matrix (ones on the diagonal, zeros elsewhere)
