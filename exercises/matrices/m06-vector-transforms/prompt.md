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

Two practical C++ notes:

- `std::sin`/`std::cos` (from `<cmath>`) use **radians**: `radians = degrees * pi / 180`.
- Floating-point results are rarely exact (`cos(90 deg)` is about `6e-17`, not `0`), so tests compare with a small tolerance. Never `==` two doubles you computed.

## Your task

`Vec2` and `PI` are provided. Implement in `solution.cpp`:

1. `double deg_to_rad(double deg)`
2. `Vec2 translate(Vec2 v, double dx, double dy)`
3. `Vec2 scale(Vec2 v, double sx, double sy)`: about the origin.
4. `Vec2 rotate(Vec2 v, double deg)`: counter-clockwise about the origin.
5. `Vec2 rotate_about(Vec2 v, double deg, Vec2 pivot)`: counter-clockwise about `pivot`.
