# Moving points: translate, scale, rotate

## Concept

Every 2D drawing, game sprite or image warp is built from three basic moves applied to points `(x, y)`:

| Transform | Formula |
|-----------|---------|
| **Translate** by `(dx, dy)` | `x' = x + dx`, `y' = y + dy` |
| **Scale** by `(sx, sy)` about the origin | `x' = x * sx`, `y' = y * sy` |
| **Rotate** by angle `a` counter-clockwise about the origin | `x' = x cos a - y sin a`, `y' = x sin a + y cos a` |

Sanity check the rotation formula by rotating `(1, 0)` by 90 degrees: `cos 90 = 0`, `sin 90 = 1`, so you get `(0, 1)`. The point swings from the x-axis up to the y-axis.

Scale and rotate act about the **origin**. To rotate around some other point (a pivot) you first slide the pivot to the origin, rotate, then slide back. That "move, do, move back" sandwich is a pattern you will see again with matrices in the next exercises.

Three practical Go notes:

- `math.Sin`/`math.Cos` use **radians**: `radians = degrees * math.Pi / 180`. `math.Pi` is an untyped constant, so it works as a `float64` directly.
- Floating-point results are rarely exact (`cos(90 deg)` is about `6e-17`, not `0`), so tests compare with a small tolerance. Never `==` two floats you computed.
- A small struct like `Vec2` is passed and returned **by value**. Functions here return a new `Vec2` and never modify the one they were given.

## Your task

`Vec2` is provided. Implement in `solution.go`:

1. `DegToRad(deg float64) float64`
2. `Translate(v Vec2, dx, dy float64) Vec2`
3. `Scale(v Vec2, sx, sy float64) Vec2`: about the origin.
4. `Rotate(v Vec2, deg float64) Vec2`: counter-clockwise about the origin.
5. `RotateAbout(v Vec2, deg float64, pivot Vec2) Vec2`: counter-clockwise about `pivot`.
