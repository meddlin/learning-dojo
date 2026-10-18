package main

import "testing"

func TestMakeMatrixHasTheRightShapeAndFill(t *testing.T) {
	Equal(t, MakeMatrix(2, 3, 7), Matrix{{7, 7, 7}, {7, 7, 7}})
}

func TestMakeMatrixRowsAreIndependent(t *testing.T) {
	m := MakeMatrix(2, 2, 0)
	m[0][0] = 5
	Equal(t, m[1][0], 0)
}

func TestMakeMatrixZeroSized(t *testing.T) {
	Equal(t, len(MakeMatrix(0, 5, 1)), 0)
}

func TestTransposeRectangular(t *testing.T) {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	Equal(t, Transpose(m), Matrix{{1, 4}, {2, 5}, {3, 6}})
}

func TestTransposeSquareAndSingleRowAndColumn(t *testing.T) {
	Equal(t, Transpose(Matrix{{1, 2}, {3, 4}}), Matrix{{1, 3}, {2, 4}})
	Equal(t, Transpose(Matrix{{1, 2, 3}}), Matrix{{1}, {2}, {3}})
	Equal(t, Transpose(Matrix{{1}, {2}, {3}}), Matrix{{1, 2, 3}})
}

func TestTransposeTwiceIsTheIdentity(t *testing.T) {
	m := Matrix{{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}}
	Equal(t, Transpose(Transpose(m)), m)
}

func TestTransposeDoesNotShareMemoryWithTheInput(t *testing.T) {
	m := Matrix{{1, 2}, {3, 4}}
	tr := Transpose(m)
	tr[0][0] = 99
	Equal(t, m[0][0], 1)
}

func TestTransposeEmpty(t *testing.T) {
	Equal(t, len(Transpose(Matrix{})), 0)
}

func TestSums(t *testing.T) {
	m := Matrix{{1, 2, 3}, {4, 5, 6}}
	Equal(t, RowSums(m), []int{6, 15})
	Equal(t, ColSums(m), []int{5, 7, 9})
}

func TestSumsOfNegativeAndSingleCells(t *testing.T) {
	Equal(t, RowSums(Matrix{{-1, 1}, {-5, -5}}), []int{0, -10})
	Equal(t, ColSums(Matrix{{-1, 1}, {-5, -5}}), []int{-6, -4})
	Equal(t, RowSums(Matrix{{42}}), []int{42})
	Equal(t, ColSums(Matrix{{42}}), []int{42})
}

func TestSumsOfTheEmptyMatrix(t *testing.T) {
	Equal(t, len(RowSums(Matrix{})), 0)
	Equal(t, len(ColSums(Matrix{})), 0)
}

func TestSymmetricMatrices(t *testing.T) {
	True(t, IsSymmetric(Matrix{{1, 2, 3}, {2, 4, 5}, {3, 5, 6}}))
	True(t, IsSymmetric(Matrix{{9}}))
	True(t, IsSymmetric(Matrix{}))
}

func TestNonSymmetricMatrices(t *testing.T) {
	False(t, IsSymmetric(Matrix{{1, 2}, {3, 4}}))
	False(t, IsSymmetric(Matrix{{1, 2, 3}, {2, 4, 5}, {3, 9, 6}}))
}

func TestNonSquareIsNeverSymmetric(t *testing.T) {
	False(t, IsSymmetric(Matrix{{1, 2, 3}, {4, 5, 6}}))
	False(t, IsSymmetric(Matrix{{1}, {1}}))
}
