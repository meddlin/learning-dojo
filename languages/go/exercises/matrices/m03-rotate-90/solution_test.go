package main

import "testing"

func chkCounting(rows, cols int) Matrix {
	m := make(Matrix, rows)
	v := 1
	for r := range m {
		m[r] = make([]int, cols)
		for c := range m[r] {
			m[r][c] = v
			v++
		}
	}
	return m
}

func TestClockwiseRectangle(t *testing.T) {
	Equal(t, RotateCW(Matrix{{1, 2, 3}, {4, 5, 6}}), Matrix{{4, 1}, {5, 2}, {6, 3}})
}

func TestClockwiseSquare(t *testing.T) {
	Equal(t, RotateCW(Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}), Matrix{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}})
}

func TestClockwiseRowAndColumnAndSingle(t *testing.T) {
	Equal(t, RotateCW(Matrix{{1, 2, 3}}), Matrix{{1}, {2}, {3}})
	Equal(t, RotateCW(Matrix{{1}, {2}, {3}}), Matrix{{3, 2, 1}})
	Equal(t, RotateCW(Matrix{{5}}), Matrix{{5}})
}

func TestCounterClockwiseRectangle(t *testing.T) {
	Equal(t, RotateCCW(Matrix{{1, 2, 3}, {4, 5, 6}}), Matrix{{3, 6}, {2, 5}, {1, 4}})
}

func TestCounterClockwiseSquare(t *testing.T) {
	Equal(t, RotateCCW(Matrix{{1, 2}, {3, 4}}), Matrix{{2, 4}, {1, 3}})
}

func TestRotate180Rectangle(t *testing.T) {
	Equal(t, Rotate180(Matrix{{1, 2, 3}, {4, 5, 6}}), Matrix{{6, 5, 4}, {3, 2, 1}})
}

func TestFourClockwiseTurnsComeBack(t *testing.T) {
	m := chkCounting(3, 5)
	r := m
	for range 4 {
		r = RotateCW(r)
	}
	Equal(t, r, m)
}

func TestCWAndCCWCancel(t *testing.T) {
	m := chkCounting(4, 2)
	Equal(t, RotateCCW(RotateCW(m)), m)
	Equal(t, RotateCW(RotateCCW(m)), m)
}

func Test180EqualsTwoClockwiseTurns(t *testing.T) {
	m := chkCounting(3, 4)
	Equal(t, Rotate180(m), RotateCW(RotateCW(m)))
}

func TestCopyingRotationsLeaveTheInputAlone(t *testing.T) {
	m := chkCounting(3, 3)
	RotateCW(m)
	RotateCCW(m)
	Rotate180(m)
	Equal(t, m, chkCounting(3, 3))
}

func TestEmptyMatrixStaysEmpty(t *testing.T) {
	Equal(t, len(RotateCW(Matrix{})), 0)
	Equal(t, len(RotateCCW(Matrix{})), 0)
	Equal(t, len(Rotate180(Matrix{})), 0)
}

func TestInPlace2x2And3x3(t *testing.T) {
	a := Matrix{{1, 2}, {3, 4}}
	RotateInPlace(a)
	Equal(t, a, Matrix{{3, 1}, {4, 2}})
	b := Matrix{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}
	RotateInPlace(b)
	Equal(t, b, Matrix{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}})
}

func TestInPlaceMatchesTheCopyingVersion(t *testing.T) {
	for _, n := range []int{1, 2, 3, 4, 5, 8, 17} {
		m := chkCounting(n, n)
		want := RotateCW(m)
		RotateInPlace(m)
		Equal(t, m, want, "n = %d", n)
	}
}

func TestInPlaceOnEmptyDoesNotCrash(t *testing.T) {
	var m Matrix
	RotateInPlace(m)
	Equal(t, len(m), 0)
}
