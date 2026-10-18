package main

import (
	"fmt"
	"math"
)

type Vec2 struct{ X, Y float64 }

type Mat3 [3][3]float64

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

func Apply(m Mat3, p Vec2) Vec2 {
	return Vec2{
		m[0][0]*p.X + m[0][1]*p.Y + m[0][2],
		m[1][0]*p.X + m[1][1]*p.Y + m[1][2],
	}
}

func main() {
	m := Multiply(Translation(5, 0), Scaling(2, 2))
	fmt.Println(Apply(m, Vec2{1, 1}))
	fmt.Println(math.Pi)
}
