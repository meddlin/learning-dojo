package main

import "testing"

func chkPt(t *testing.T, p Vec2, x, y float64) {
	t.Helper()
	Near(t, p.X, x, 1e-9, "x coordinate of %+v", p)
	Near(t, p.Y, y, 1e-9, "y coordinate of %+v", p)
}

func chkMatrixNear(t *testing.T, got, want Mat3) {
	t.Helper()
	for r := range 3 {
		for c := range 3 {
			Near(t, got[r][c], want[r][c], 1e-9, "cell (%d, %d) of %v", r, c, got)
		}
	}
}

func TestIdentityHasOnesOnTheDiagonalOnly(t *testing.T) {
	id := Identity3()
	for r := range 3 {
		for c := range 3 {
			want := 0.0
			if r == c {
				want = 1.0
			}
			Equal(t, id[r][c], want, "cell (%d, %d)", r, c)
		}
	}
}

func TestIdentityLeavesPointsAlone(t *testing.T) {
	chkPt(t, Apply(Identity3(), Vec2{3.5, -2}), 3.5, -2)
}

func TestTranslationLayoutAndEffect(t *testing.T) {
	m := Translation(2, 3)
	Equal(t, m[0][2], 2.0)
	Equal(t, m[1][2], 3.0)
	Equal(t, m[2][2], 1.0)
	Equal(t, m[0][0], 1.0)
	Equal(t, m[1][1], 1.0)
	chkPt(t, Apply(m, Vec2{1, 1}), 3, 4)
	chkPt(t, Apply(m, Vec2{0, 0}), 2, 3)
}

func TestScalingLayoutAndEffect(t *testing.T) {
	m := Scaling(2, 3)
	Equal(t, m[0][0], 2.0)
	Equal(t, m[1][1], 3.0)
	Equal(t, m[2][2], 1.0)
	chkPt(t, Apply(m, Vec2{4, 5}), 8, 15)
}

func TestRotationQuarterAndHalfTurns(t *testing.T) {
	chkPt(t, Apply(Rotation(90), Vec2{1, 0}), 0, 1)
	chkPt(t, Apply(Rotation(180), Vec2{1, 2}), -1, -2)
	chkPt(t, Apply(Rotation(-90), Vec2{1, 0}), 0, -1)
}

func TestRotationLeavesTheBottomRowAlone(t *testing.T) {
	m := Rotation(33)
	Equal(t, m[2][0], 0.0)
	Equal(t, m[2][1], 0.0)
	Equal(t, m[2][2], 1.0)
}

func TestMultiplyingByIdentityChangesNothing(t *testing.T) {
	m := Multiply(Translation(1, 2), Rotation(40))
	chkMatrixNear(t, Multiply(m, Identity3()), m)
	chkMatrixNear(t, Multiply(Identity3(), m), m)
}

func TestTheRightHandMatrixActsFirst(t *testing.T) {
	p := Vec2{1, 1}
	// T * S: scale, then translate -> (1,1) -> (2,2) -> (7,2)
	chkPt(t, Apply(Multiply(Translation(5, 0), Scaling(2, 2)), p), 7, 2)
	// S * T: translate, then scale -> (1,1) -> (6,1) -> (12,2)
	chkPt(t, Apply(Multiply(Scaling(2, 2), Translation(5, 0)), p), 12, 2)
}

func TestCompositionEqualsApplyingOneAfterAnother(t *testing.T) {
	tr, r, s := Translation(3, -1), Rotation(25), Scaling(2, 0.5)
	all := Multiply(tr, Multiply(r, s))
	p := Vec2{1.5, 2.5}
	step := Apply(tr, Apply(r, Apply(s, p)))
	once := Apply(all, p)
	chkPt(t, once, step.X, step.Y)
}

func TestMultiplicationIsAssociative(t *testing.T) {
	a, b, c := Rotation(10), Translation(1, 2), Scaling(3, 4)
	chkMatrixNear(t, Multiply(Multiply(a, b), c), Multiply(a, Multiply(b, c)))
}

func TestMultiplyDoesNotChangeItsArguments(t *testing.T) {
	a, b := Translation(1, 2), Scaling(3, 4)
	aCopy, bCopy := a, b
	Multiply(a, b)
	Equal(t, a, aCopy)
	Equal(t, b, bCopy)
}

func TestRotationFollowedByItsInverseIsTheIdentity(t *testing.T) {
	chkMatrixNear(t, Multiply(Rotation(30), Rotation(-30)), Identity3())
}

func TestTranslationFollowedByItsInverseIsTheIdentity(t *testing.T) {
	chkMatrixNear(t, Multiply(Translation(4, -7), Translation(-4, 7)), Identity3())
}
