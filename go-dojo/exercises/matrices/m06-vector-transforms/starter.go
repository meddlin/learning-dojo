package main

import (
	"fmt"
	"math"
)

// Vec2 is a point (or vector) in the plane.
type Vec2 struct{ X, Y float64 }

// DegToRad converts degrees to radians.
func DegToRad(deg float64) float64 {
	return 0 // TODO
}

// Translate moves v by (dx, dy).
func Translate(v Vec2, dx, dy float64) Vec2 {
	return Vec2{} // TODO
}

// Scale stretches v by (sx, sy) about the origin.
func Scale(v Vec2, sx, sy float64) Vec2 {
	return Vec2{} // TODO
}

// Rotate turns v counter-clockwise by deg degrees about the origin.
func Rotate(v Vec2, deg float64) Vec2 {
	return Vec2{} // TODO
}

// RotateAbout turns v counter-clockwise by deg degrees about pivot.
func RotateAbout(v Vec2, deg float64, pivot Vec2) Vec2 {
	return Vec2{} // TODO
}

func main() {
	fmt.Println(Rotate(Vec2{1, 0}, 90))
	fmt.Println(math.Pi)
}
