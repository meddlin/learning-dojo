package main

import (
	"slices"
	"testing"
)

func TestSquareSpiral(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}), []int{1, 2, 3, 6, 9, 8, 7, 4, 5})
}

func TestWideRectangle(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}}), []int{1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7})
}

func TestTallRectangle(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1, 2}, {3, 4}, {5, 6}, {7, 8}}), []int{1, 2, 4, 6, 8, 7, 5, 3})
}

func TestSingleRowIsNotWalkedTwice(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1, 2, 3, 4}}), []int{1, 2, 3, 4})
}

func TestSingleColumnIsNotWalkedTwice(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1}, {2}, {3}}), []int{1, 2, 3})
}

func TestSingleCellAndEmpty(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{7}}), []int{7})
	Equal(t, len(SpiralOrder(Matrix{})), 0)
}

func TestTwoByTwoAndOddMiddle(t *testing.T) {
	Equal(t, SpiralOrder(Matrix{{1, 2}, {3, 4}}), []int{1, 2, 4, 3})
	Equal(t, SpiralOrder(Matrix{{1, 2, 3}, {4, 5, 6}}), []int{1, 2, 3, 6, 5, 4})
}

func TestEveryCellExactlyOnce(t *testing.T) {
	for rows := 1; rows <= 7; rows++ {
		for cols := 1; cols <= 7; cols++ {
			m := make(Matrix, rows)
			v := 0
			for r := range m {
				m[r] = make([]int, cols)
				for c := range m[r] {
					m[r][c] = v
					v++
				}
			}
			out := SpiralOrder(m)
			Equal(t, len(out), rows*cols, "%d x %d", rows, cols)
			sorted := slices.Clone(out)
			slices.Sort(sorted)
			all := make([]int, rows*cols)
			for i := range all {
				all[i] = i
			}
			Equal(t, sorted, all, "%d x %d", rows, cols)
		}
	}
}

func TestSpiralMatrixSmall(t *testing.T) {
	Equal(t, SpiralMatrix(1), Matrix{{1}})
	Equal(t, SpiralMatrix(2), Matrix{{1, 2}, {4, 3}})
	Equal(t, SpiralMatrix(3), Matrix{{1, 2, 3}, {8, 9, 4}, {7, 6, 5}})
}

func TestSpiralMatrixFour(t *testing.T) {
	Equal(t, SpiralMatrix(4), Matrix{{1, 2, 3, 4}, {12, 13, 14, 5}, {11, 16, 15, 6}, {10, 9, 8, 7}})
}

func TestSpiralMatrixZero(t *testing.T) {
	Equal(t, len(SpiralMatrix(0)), 0)
}

func TestReadingASpiralMatrixInSpiralOrderCountsUp(t *testing.T) {
	for _, n := range []int{1, 2, 5, 6, 9} {
		want := make([]int, n*n)
		for i := range want {
			want[i] = i + 1
		}
		Equal(t, SpiralOrder(SpiralMatrix(n)), want, "n = %d", n)
	}
}
