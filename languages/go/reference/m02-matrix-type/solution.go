package main

import (
	"fmt"
	"slices"
)

type Matrix struct {
	rows, cols int
	data       []float64
}

func NewMatrix(rows, cols int, fill float64) *Matrix {
	m := &Matrix{rows: rows, cols: cols, data: make([]float64, rows*cols)}
	for i := range m.data {
		m.data[i] = fill
	}
	return m
}

func Identity(n int) *Matrix {
	m := NewMatrix(n, n, 0)
	for i := range n {
		m.Set(i, i, 1)
	}
	return m
}

func (m *Matrix) Rows() int { return m.rows }
func (m *Matrix) Cols() int { return m.cols }

func (m *Matrix) At(r, c int) float64 { return m.data[r*m.cols+c] }

func (m *Matrix) Set(r, c int, v float64) { m.data[r*m.cols+c] = v }

func (m *Matrix) Data() []float64 { return m.data }

func (m *Matrix) Transposed() *Matrix {
	t := NewMatrix(m.cols, m.rows, 0)
	for r := range m.rows {
		for c := range m.cols {
			t.Set(c, r, m.At(r, c))
		}
	}
	return t
}

func (m *Matrix) Clone() *Matrix {
	return &Matrix{rows: m.rows, cols: m.cols, data: slices.Clone(m.data)}
}

func (m *Matrix) Equal(o *Matrix) bool {
	return m.rows == o.rows && m.cols == o.cols && slices.Equal(m.data, o.data)
}

func main() {
	m := NewMatrix(2, 3, 1)
	m.Set(1, 2, 5)
	fmt.Println(m.Data())
}
