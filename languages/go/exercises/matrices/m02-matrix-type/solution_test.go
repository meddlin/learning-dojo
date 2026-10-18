package main

import "testing"

func TestShapeAndFill(t *testing.T) {
	m := NewMatrix(2, 3, 4.5)
	Equal(t, m.Rows(), 2)
	Equal(t, m.Cols(), 3)
	for r := range 2 {
		for c := range 3 {
			Equal(t, m.At(r, c), 4.5, "cell (%d, %d)", r, c)
		}
	}
}

func TestCellsCanBeAssignedIndependently(t *testing.T) {
	m := NewMatrix(3, 3, 0)
	m.Set(0, 2, 1)
	m.Set(2, 0, 2)
	m.Set(1, 1, 3)
	Equal(t, m.At(0, 2), 1.0)
	Equal(t, m.At(2, 0), 2.0)
	Equal(t, m.At(1, 1), 3.0)
	Equal(t, m.At(0, 0), 0.0)
	Equal(t, m.At(2, 2), 0.0)
}

func TestStorageIsRowMajor(t *testing.T) {
	m := NewMatrix(2, 3, 0)
	v := 1.0
	for r := range 2 {
		for c := range 3 {
			m.Set(r, c, v)
			v++
		}
	}
	Equal(t, m.Data(), []float64{1, 2, 3, 4, 5, 6})
}

func TestDataIsTheRealStorage(t *testing.T) {
	m := NewMatrix(2, 2, 0)
	m.Data()[3] = 9
	Equal(t, m.At(1, 1), 9.0)
}

func TestCloneIsIndependent(t *testing.T) {
	a := NewMatrix(2, 2, 1.0)
	b := a.Clone()
	b.Set(0, 0, 99)
	Equal(t, a.At(0, 0), 1.0)
	Equal(t, b.At(0, 0), 99.0)
	Equal(t, b.Rows(), 2)
	Equal(t, b.Cols(), 2)
}

func TestTransposedSwapsTheShapeAndCells(t *testing.T) {
	m := NewMatrix(2, 3, 0)
	v := 1.0
	for r := range 2 {
		for c := range 3 {
			m.Set(r, c, v)
			v++
		}
	}
	tr := m.Transposed()
	Equal(t, tr.Rows(), 3)
	Equal(t, tr.Cols(), 2)
	Equal(t, tr.At(0, 0), 1.0)
	Equal(t, tr.At(0, 1), 4.0)
	Equal(t, tr.At(1, 0), 2.0)
	Equal(t, tr.At(2, 1), 6.0)
}

func TestTransposedDoesNotChangeTheOriginal(t *testing.T) {
	m := NewMatrix(1, 2, 0)
	m.Set(0, 0, 1)
	m.Set(0, 1, 2)
	_ = m.Transposed()
	Equal(t, m.Rows(), 1)
	Equal(t, m.Cols(), 2)
	Equal(t, m.At(0, 1), 2.0)
}

func TestIdentityMatrix(t *testing.T) {
	id := Identity(3)
	Equal(t, id.Rows(), 3)
	Equal(t, id.Cols(), 3)
	for r := range 3 {
		for c := range 3 {
			want := 0.0
			if r == c {
				want = 1.0
			}
			Equal(t, id.At(r, c), want, "cell (%d, %d)", r, c)
		}
	}
}

func TestEquality(t *testing.T) {
	a, b, c := NewMatrix(2, 2, 3.0), NewMatrix(2, 2, 3.0), NewMatrix(2, 2, 4.0)
	d, e := NewMatrix(2, 3, 3.0), NewMatrix(3, 2, 3.0)
	True(t, a.Equal(b))
	False(t, a.Equal(c))
	False(t, a.Equal(d))
	False(t, d.Equal(e))
	b.Set(1, 1, 0)
	False(t, a.Equal(b))
}

func TestATransposedIdentityIsTheIdentity(t *testing.T) {
	True(t, Identity(4).Transposed().Equal(Identity(4)))
}

func TestALargeMatrixIsOneSliceSizedCorrectly(t *testing.T) {
	big := NewMatrix(300, 200, 1.0)
	big.Set(299, 199, 7)
	Equal(t, big.At(299, 199), 7.0)
	Equal(t, len(big.Data()), 300*200)
	Equal(t, big.Data()[299*200+199], 7.0)
}
