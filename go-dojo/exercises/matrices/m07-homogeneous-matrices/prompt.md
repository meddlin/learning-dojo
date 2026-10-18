# Homogeneous coordinates: one matrix for everything

## Concept

Scaling and rotation are matrix multiplications of the point `(x, y)`. Translation is *adding* a vector, so it does not fit... until you add a third coordinate that is always `1`. Treat the point `(x, y)` as the column `(x, y, 1)`. Now all three transforms are 3x3 matrices:

```
Translation(tx, ty)      Scaling(sx, sy)         Rotation(t)
| 1 0 tx |               | sx 0  0 |             | cos t  -sin t  0 |
| 0 1 ty |               | 0  sy 0 |             | sin t   cos t  0 |
| 0 0 1  |               | 0  0  1 |             | 0       0      1 |
```

Check translation: multiplying `(x, y, 1)` by the first matrix gives `(x + tx, y + ty, 1)`. The `1` is what makes the last column act as an addition.

The big payoff is **composition**. Applying several transforms in sequence is a *single* matrix: multiply them together once and apply that matrix to as many points as you like (a whole image, a 3D mesh...). This is how graphics hardware and every game engine work.

**Order matters.** With points as column vectors the matrix nearest the point acts first:

```
M = T * R * S        // scale first, then rotate, then translate
p' = M * p = T * (R * (S * p))
```

Read products right to left. Getting this backwards is the #1 transform bug.

A Go detail: `Mat3` is declared as the **array** type `[3][3]float64`, not a slice. Arrays have a fixed size that is part of their type, and they are **values**: `b := a` copies all nine numbers, and passing a `Mat3` to a function gives it its own copy. That is exactly what you want for a tiny fixed-size matrix: no allocation, no aliasing, nothing to forget to copy.

## Your task

`Vec2` and `Mat3` (`[3][3]float64`, row-major: `m[row][col]`) are provided. Implement in `solution.go`:

1. `Identity3() Mat3`
2. `Translation(tx, ty float64) Mat3`
3. `Scaling(sx, sy float64) Mat3`
4. `Rotation(degrees float64) Mat3`: counter-clockwise.
5. `Multiply(a, b Mat3) Mat3`: the matrix product `a * b`.
6. `Apply(m Mat3, p Vec2) Vec2`: transform the point (treat it as `(x, y, 1)`).
