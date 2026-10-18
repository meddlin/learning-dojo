package main

import (
	"fmt"
	"math"
)

type Vec2 struct{ X, Y float64 }

type Mat3 [3][3]float64

type Box struct{ MinX, MinY, MaxX, MaxY float64 }

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

func RotationAbout(degrees float64, pivot Vec2) Mat3 {
	return Multiply(Translation(pivot.X, pivot.Y), Multiply(Rotation(degrees), Translation(-pivot.X, -pivot.Y)))
}

func ScalingAbout(sx, sy float64, pivot Vec2) Mat3 {
	return Multiply(Translation(pivot.X, pivot.Y), Multiply(Scaling(sx, sy), Translation(-pivot.X, -pivot.Y)))
}

func TransformAll(m Mat3, pts []Vec2) []Vec2 {
	out := make([]Vec2, len(pts))
	for i, p := range pts {
		out[i] = Apply(m, p)
	}
	return out
}

func Compose(steps []Mat3) Mat3 {
	result := Identity3()
	for _, s := range steps {
		result = Multiply(s, result)
	}
	return result
}

func InvertRigid(m Mat3) Mat3 {
	inv := Identity3()
	// Transposed rotation block.
	inv[0][0], inv[0][1] = m[0][0], m[1][0]
	inv[1][0], inv[1][1] = m[0][1], m[1][1]
	// Translation column: -(R^T t).
	tx, ty := m[0][2], m[1][2]
	inv[0][2] = -(inv[0][0]*tx + inv[0][1]*ty)
	inv[1][2] = -(inv[1][0]*tx + inv[1][1]*ty)
	return inv
}

func BoundingBox(pts []Vec2) Box {
	if len(pts) == 0 {
		return Box{}
	}
	b := Box{pts[0].X, pts[0].Y, pts[0].X, pts[0].Y}
	for _, p := range pts[1:] {
		b.MinX = min(b.MinX, p.X)
		b.MinY = min(b.MinY, p.Y)
		b.MaxX = max(b.MaxX, p.X)
		b.MaxY = max(b.MaxY, p.Y)
	}
	return b
}

func main() {
	square := []Vec2{{0, 0}, {2, 0}, {2, 2}, {0, 2}}
	fmt.Println(TransformAll(Translation(10, 0), square))
}
