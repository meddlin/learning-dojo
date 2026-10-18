package main

import "testing"

func TestIdentityMatrix(t *testing.T) {
	Equal(t, Identity(1), Mat{{1}})
	Equal(t, Identity(3), Mat{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}})
}

func TestMultiplyTwoByTwo(t *testing.T) {
	a := Mat{{1, 2}, {3, 4}}
	b := Mat{{5, 6}, {7, 8}}
	Equal(t, Multiply(a, b), Mat{{19, 22}, {43, 50}})
}

func TestMultiplicationIsNotCommutative(t *testing.T) {
	a := Mat{{1, 2}, {3, 4}}
	b := Mat{{5, 6}, {7, 8}}
	Equal(t, Multiply(b, a), Mat{{23, 34}, {31, 46}})
}

func TestMultiplyRectangularMatrices(t *testing.T) {
	a := Mat{{1, 2, 3}, {4, 5, 6}}      // 2 x 3
	b := Mat{{7, 8}, {9, 10}, {11, 12}} // 3 x 2
	Equal(t, Multiply(a, b), Mat{{58, 64}, {139, 154}})
	Equal(t, Multiply(b, a), Mat{{39, 54, 69}, {49, 68, 87}, {59, 82, 105}})
}

func TestMultiplyByAColumnVector(t *testing.T) {
	a := Mat{{1, 2}, {3, 4}}
	v := Mat{{5}, {6}}
	Equal(t, Multiply(a, v), Mat{{17}, {39}})
}

func TestIdentityIsNeutral(t *testing.T) {
	a := Mat{{2, -1, 0}, {5, 7, 3}, {1, 1, 1}}
	Equal(t, Multiply(a, Identity(3)), a)
	Equal(t, Multiply(Identity(3), a), a)
}

func TestMultiplicationIsAssociative(t *testing.T) {
	a, b, c := Mat{{1, 2}, {3, 4}}, Mat{{0, 1}, {1, 1}}, Mat{{2, 0}, {1, 3}}
	Equal(t, Multiply(Multiply(a, b), c), Multiply(a, Multiply(b, c)))
}

func TestMultiplyDoesNotModifyItsInputs(t *testing.T) {
	a := Mat{{1, 2}, {3, 4}}
	b := Mat{{5, 6}, {7, 8}}
	Multiply(a, b)
	Equal(t, a, Mat{{1, 2}, {3, 4}})
	Equal(t, b, Mat{{5, 6}, {7, 8}})
}

func TestPowerZeroAndOne(t *testing.T) {
	a := Mat{{2, 1}, {1, 1}}
	Equal(t, MatPow(a, 0), Identity(2))
	Equal(t, MatPow(a, 1), a)
}

func TestSmallPowersMatchRepeatedMultiplication(t *testing.T) {
	a := Mat{{1, 1, 0}, {0, 1, 1}, {1, 0, 1}}
	expected := Identity(3)
	for e := int64(0); e <= 12; e++ {
		Equal(t, MatPow(a, e), expected, "exponent %d", e)
		expected = Multiply(expected, a)
	}
}

func TestPowerDoesNotModifyTheBase(t *testing.T) {
	a := Mat{{2, 1}, {1, 1}}
	MatPow(a, 5)
	Equal(t, a, Mat{{2, 1}, {1, 1}})
}

func TestHugeExponentNeedsLogarithmicWork(t *testing.T) {
	// Identity^huge and a swap matrix^huge are cheap if you square; hopeless if you loop.
	Equal(t, MatPow(Identity(2), 1_000_000_000_000_000), Identity(2))
	swap := Mat{{0, 1}, {1, 0}}
	Equal(t, MatPow(swap, 1_000_000_000_000_000), Identity(2))
	Equal(t, MatPow(swap, 1_000_000_000_000_001), swap)
}

func TestFibonacciSmallValues(t *testing.T) {
	want := []int64{0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55}
	for n := 0; n <= 10; n++ {
		Equal(t, Fibonacci(n), want[n], "n = %d", n)
	}
}

func TestFibonacciLargeValues(t *testing.T) {
	Equal(t, Fibonacci(50), int64(12586269025))
	Equal(t, Fibonacci(90), int64(2880067194370816120))
}
