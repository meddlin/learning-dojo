package main

import (
	"fmt"
	"math"
)

// Vec2 is a point in the plane.
type Vec2 struct{ X, Y float64 }

// Mat3 is a 3x3 matrix, row-major: m[row][col]. It is an array, so it is
// copied when assigned or passed to a function.
type Mat3 [3][3]float64

// Identity3 returns the 3x3 identity matrix.
func Identity3() Mat3 {
	return Mat3{} // TODO
}

// Translation returns the matrix that moves points by (tx, ty).
func Translation(tx, ty float64) Mat3 {
	return Mat3{} // TODO
}

// Scaling returns the matrix that scales by (sx, sy) about the origin.
func Scaling(sx, sy float64) Mat3 {
	return Mat3{} // TODO
}

// Rotation returns the matrix that rotates counter-clockwise by the given degrees
// about the origin.
func Rotation(degrees float64) Mat3 {
	return Mat3{} // TODO
}

// Multiply returns the matrix product a * b (b acts on a point first).
func Multiply(a, b Mat3) Mat3 {
	return Mat3{} // TODO
}

// Apply transforms the point p (treated as the column (x, y, 1)) by m.
func Apply(m Mat3, p Vec2) Vec2 {
	return Vec2{} // TODO
}

func main() {
	m := Multiply(Translation(5, 0), Scaling(2, 2))
	fmt.Println(Apply(m, Vec2{1, 1}))
	fmt.Println(math.Pi)
}
