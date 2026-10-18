package main

import (
	"math"
	"testing"
)

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

func TestRotationAboutAPivot(t *testing.T) {
	chkPt(t, Apply(RotationAbout(90, Vec2{1, 1}), Vec2{2, 1}), 1, 2)
	chkPt(t, Apply(RotationAbout(180, Vec2{3, 3}), Vec2{5, 5}), 1, 1)
}

func TestThePivotIsAFixedPointOfRotation(t *testing.T) {
	chkPt(t, Apply(RotationAbout(77, Vec2{4, -2}), Vec2{4, -2}), 4, -2)
}

func TestRotationAboutTheOriginIsPlainRotation(t *testing.T) {
	chkMatrixNear(t, RotationAbout(35, Vec2{0, 0}), Rotation(35))
}

func TestScalingAboutAPivot(t *testing.T) {
	chkPt(t, Apply(ScalingAbout(2, 2, Vec2{1, 1}), Vec2{2, 3}), 3, 5)
	chkPt(t, Apply(ScalingAbout(5, 0.5, Vec2{-3, 7}), Vec2{-3, 7}), -3, 7)
}

func TestTransformAllKeepsOrderAndCount(t *testing.T) {
	pts := []Vec2{{0, 0}, {1, 0}, {1, 1}}
	out := TransformAll(Translation(10, 20), pts)
	Equal(t, len(out), 3)
	chkPt(t, out[0], 10, 20)
	chkPt(t, out[1], 11, 20)
	chkPt(t, out[2], 11, 21)
	Equal(t, len(TransformAll(Identity3(), nil)), 0)
}

func TestTransformAllDoesNotModifyTheInput(t *testing.T) {
	pts := []Vec2{{1, 2}, {3, 4}}
	TransformAll(Scaling(2, 2), pts)
	chkPt(t, pts[0], 1, 2)
	chkPt(t, pts[1], 3, 4)
}

func TestComposeOfNothingIsIdentity(t *testing.T) {
	chkMatrixNear(t, Compose(nil), Identity3())
}

func TestComposeOfOneStep(t *testing.T) {
	chkMatrixNear(t, Compose([]Mat3{Rotation(20)}), Rotation(20))
}

func TestComposeAppliesTheFirstStepFirst(t *testing.T) {
	// translate by (1,0) first, then scale by 2 -> (0,0) -> (1,0) -> (2,0)
	chkPt(t, Apply(Compose([]Mat3{Translation(1, 0), Scaling(2, 2)}), Vec2{0, 0}), 2, 0)
	// scale first, then translate -> (0,0) -> (0,0) -> (1,0)
	chkPt(t, Apply(Compose([]Mat3{Scaling(2, 2), Translation(1, 0)}), Vec2{0, 0}), 1, 0)
}

func TestComposeMatchesStepByStepApplication(t *testing.T) {
	steps := []Mat3{Scaling(2, 3), Rotation(30), Translation(-4, 5), Rotation(-10)}
	p := Vec2{1.25, -0.75}
	manual := p
	for _, s := range steps {
		manual = Apply(s, manual)
	}
	once := Apply(Compose(steps), p)
	chkPt(t, once, manual.X, manual.Y)
}

func TestInvertATranslation(t *testing.T) {
	chkMatrixNear(t, InvertRigid(Translation(3, -4)), Translation(-3, 4))
}

func TestInvertARotation(t *testing.T) {
	chkMatrixNear(t, InvertRigid(Rotation(50)), Rotation(-50))
}

func TestInvertARotationPlusTranslation(t *testing.T) {
	m := Multiply(Translation(3, 4), Rotation(30))
	chkMatrixNear(t, Multiply(InvertRigid(m), m), Identity3())
	chkMatrixNear(t, Multiply(m, InvertRigid(m)), Identity3())
}

func TestInverseBringsPointsHome(t *testing.T) {
	m := Compose([]Mat3{Rotation(-70), Translation(9, -2), Rotation(15)})
	p := Vec2{2.5, 8.0}
	back := Apply(InvertRigid(m), Apply(m, p))
	chkPt(t, back, 2.5, 8.0)
}

func TestBoundingBoxOfAFewPoints(t *testing.T) {
	b := BoundingBox([]Vec2{{1, 5}, {-2, 3}, {4, -1}})
	Equal(t, b, Box{MinX: -2, MinY: -1, MaxX: 4, MaxY: 5})
}

func TestBoundingBoxOfOnePointAndOfNegativePoints(t *testing.T) {
	Equal(t, BoundingBox([]Vec2{{3, 4}}), Box{MinX: 3, MinY: 4, MaxX: 3, MaxY: 4})
	Equal(t, BoundingBox([]Vec2{{-5, -6}, {-1, -9}}), Box{MinX: -5, MinY: -9, MaxX: -1, MaxY: -6})
}

func TestBoundingBoxOfNothingIsZero(t *testing.T) {
	Equal(t, BoundingBox(nil), Box{})
}

func TestASquareRotated45DegreesAboutItsCentre(t *testing.T) {
	square := []Vec2{{0, 0}, {2, 0}, {2, 2}, {0, 2}}
	r := TransformAll(RotationAbout(45, Vec2{1, 1}), square)
	b := BoundingBox(r)
	halfDiag := math.Sqrt(2)
	Near(t, b.MinX, 1-halfDiag, 1e-9)
	Near(t, b.MaxX, 1+halfDiag, 1e-9)
	Near(t, b.MinY, 1-halfDiag, 1e-9)
	Near(t, b.MaxY, 1+halfDiag, 1e-9)
}
