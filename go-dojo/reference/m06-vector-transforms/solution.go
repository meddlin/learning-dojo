package main

import (
	"fmt"
	"math"
)

type Vec2 struct{ X, Y float64 }

func DegToRad(deg float64) float64 { return deg * math.Pi / 180 }

func Translate(v Vec2, dx, dy float64) Vec2 { return Vec2{v.X + dx, v.Y + dy} }

func Scale(v Vec2, sx, sy float64) Vec2 { return Vec2{v.X * sx, v.Y * sy} }

func Rotate(v Vec2, deg float64) Vec2 {
	a := DegToRad(deg)
	cos, sin := math.Cos(a), math.Sin(a)
	return Vec2{v.X*cos - v.Y*sin, v.X*sin + v.Y*cos}
}

func RotateAbout(v Vec2, deg float64, pivot Vec2) Vec2 {
	moved := Translate(v, -pivot.X, -pivot.Y)
	return Translate(Rotate(moved, deg), pivot.X, pivot.Y)
}

func main() {
	fmt.Println(Rotate(Vec2{1, 0}, 90))
	fmt.Println(math.Pi)
}
