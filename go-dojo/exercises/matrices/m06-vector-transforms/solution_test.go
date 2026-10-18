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

func TestDegreesToRadians(t *testing.T) {
	Near(t, DegToRad(0), 0, 1e-12)
	Near(t, DegToRad(180), math.Pi, 1e-12)
	Near(t, DegToRad(90), math.Pi/2, 1e-12)
	Near(t, DegToRad(-45), -math.Pi/4, 1e-12)
}

func TestTranslateMovesAPoint(t *testing.T) {
	chkPt(t, Translate(Vec2{1, 2}, 3, -5), 4, -3)
}

func TestScaleStretchesAboutTheOrigin(t *testing.T) {
	chkPt(t, Scale(Vec2{2, 3}, 2, 0.5), 4, 1.5)
	chkPt(t, Scale(Vec2{2, 3}, -1, 1), -2, 3)
}

func TestRotateQuarterTurns(t *testing.T) {
	chkPt(t, Rotate(Vec2{1, 0}, 90), 0, 1)
	chkPt(t, Rotate(Vec2{1, 0}, 180), -1, 0)
	chkPt(t, Rotate(Vec2{1, 0}, 270), 0, -1)
	chkPt(t, Rotate(Vec2{0, 1}, 90), -1, 0)
}

func TestRotateByZeroAndFullTurn(t *testing.T) {
	chkPt(t, Rotate(Vec2{3, -4}, 0), 3, -4)
	chkPt(t, Rotate(Vec2{3, -4}, 360), 3, -4)
}

func TestRotateBy45Degrees(t *testing.T) {
	h := math.Sqrt(2) / 2
	chkPt(t, Rotate(Vec2{1, 0}, 45), h, h)
	chkPt(t, Rotate(Vec2{1, 1}, 45), 0, math.Sqrt(2))
}

func TestRotationPreservesDistanceFromTheOrigin(t *testing.T) {
	v := Vec2{3, 4}
	for deg := -170.0; deg <= 170; deg += 17 {
		r := Rotate(v, deg)
		Near(t, math.Hypot(r.X, r.Y), 5, 1e-9, "angle %v", deg)
	}
}

func TestRotatingBackUndoesARotation(t *testing.T) {
	v := Vec2{2.5, -1.25}
	chkPt(t, Rotate(Rotate(v, 37), -37), 2.5, -1.25)
}

func TestRotateAboutAPivot(t *testing.T) {
	chkPt(t, RotateAbout(Vec2{2, 1}, 90, Vec2{1, 1}), 1, 2)
	chkPt(t, RotateAbout(Vec2{5, 5}, 180, Vec2{3, 3}), 1, 1)
}

func TestThePivotItselfDoesNotMove(t *testing.T) {
	chkPt(t, RotateAbout(Vec2{4, -2}, 123, Vec2{4, -2}), 4, -2)
}

func TestPivotAtTheOriginMatchesPlainRotate(t *testing.T) {
	a := RotateAbout(Vec2{1, 2}, 30, Vec2{0, 0})
	b := Rotate(Vec2{1, 2}, 30)
	chkPt(t, a, b.X, b.Y)
}
