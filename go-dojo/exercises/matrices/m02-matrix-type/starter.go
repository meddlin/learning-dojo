package main

import "fmt"

// Matrix stores a rows x cols matrix of float64 in one row-major slice:
// cell (r, c) is data[r*cols + c].
type Matrix struct {
	rows, cols int
	data       []float64
}

// NewMatrix returns a rows x cols matrix with every cell set to fill.
func NewMatrix(rows, cols int, fill float64) *Matrix {
	return &Matrix{} // TODO
}

// Identity returns the n x n identity matrix.
func Identity(n int) *Matrix {
	return &Matrix{} // TODO
}

func (m *Matrix) Rows() int { return m.rows }
func (m *Matrix) Cols() int { return m.cols }

// At returns the value at row r, column c.
func (m *Matrix) At(r, c int) float64 {
	return 0 // TODO
}

// Set stores v at row r, column c.
func (m *Matrix) Set(r, c int, v float64) {
	// TODO
}

// Data returns the flat row-major storage (the real slice, not a copy).
func (m *Matrix) Data() []float64 {
	return nil // TODO
}

// Transposed returns a new matrix with rows and columns swapped.
func (m *Matrix) Transposed() *Matrix {
	return &Matrix{} // TODO
}

// Clone returns an independent copy: changing the clone must not change m.
func (m *Matrix) Clone() *Matrix {
	return &Matrix{} // TODO
}

// Equal reports whether o has the same shape and the same values.
func (m *Matrix) Equal(o *Matrix) bool {
	return false // TODO
}

func main() {
	m := NewMatrix(2, 3, 1)
	m.Set(1, 2, 5)
	fmt.Println(m.Data())
}
