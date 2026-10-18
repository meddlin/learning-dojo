package main

import (
	"fmt"
	"math"
)

type Vec2 struct{ X, Y float64 }

// Mat3 is a 3x3 matrix, row-major: m[row][col]. It is an array, so it is copied
// when assigned or passed to a function.
type Mat3 [3][3]float64

// Box is an axis-aligned bounding box.
type Box struct{ MinX, MinY, MaxX, MaxY float64 }

// --- building blocks from the previous exercise (already done) ---

func Identity3() Mat3 {
	return Mat3{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}
}

func Translation(tx, ty float64) Mat3 {
	m := Identity3()
	m[0][2], m[1][2] = tx, ty
	return m
}

func Scaling(sx, sy float64) Mat3 {
	m := Identity3()
	m[0][0], m[1][1] = sx, sy
	return m
}

func Rotation(degrees float64) Mat3 {
	a := degrees * math.Pi / 180
	cos, sin := math.Cos(a), math.Sin(a)
	return Mat3{{cos, -sin, 0}, {sin, cos, 0}, {0, 0, 1}}
}

// Multiply returns a * b (b acts on a point first).
func Multiply(a, b Mat3) Mat3 {
	var out Mat3
	for i := range 3 {
		for j := range 3 {
			for k := range 3 {
				out[i][j] += a[i][k] * b[k][j]
			}
		}
	}
	return out
}

// Apply transforms the point p (as the column (x, y, 1)) by m.
func Apply(m Mat3, p Vec2) Vec2 {
	return Vec2{
		m[0][0]*p.X + m[0][1]*p.Y + m[0][2],
		m[1][0]*p.X + m[1][1]*p.Y + m[1][2],
	}
}

// --- your work starts here ---

// RotationAbout rotates counter-clockwise by degrees around pivot.
func RotationAbout(degrees float64, pivot Vec2) Mat3 {
	return Identity3() // TODO
}

// ScalingAbout scales by (sx, sy) around pivot; the pivot stays where it is.
func ScalingAbout(sx, sy float64, pivot Vec2) Mat3 {
	return Identity3() // TODO
}

// TransformAll returns every point of pts transformed by m, in the same order.
// Build a new slice; do not modify pts.
func TransformAll(m Mat3, pts []Vec2) []Vec2 {
	return nil // TODO
}

// Compose returns the single matrix that applies steps[0] first, then steps[1], ...
// An empty list gives the identity.
func Compose(steps []Mat3) Mat3 {
	return Identity3() // TODO
}

// InvertRigid returns the inverse of a matrix made only of rotations and translations.
func InvertRigid(m Mat3) Mat3 {
	return Identity3() // TODO
}

// BoundingBox returns the smallest axis-aligned box containing all of pts.
// For an empty list return a Box with all four fields 0.
func BoundingBox(pts []Vec2) Box {
	return Box{} // TODO
}

func main() {
	square := []Vec2{{0, 0}, {2, 0}, {2, 2}, {0, 2}}
	fmt.Println(TransformAll(Translation(10, 0), square))
}
