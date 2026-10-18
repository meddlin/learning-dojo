# Transform pipelines

## Concept

Now put the 3x3 matrices to work on real tasks. The building blocks (`Identity3`, `Translation`, `Scaling`, `Rotation`, `Multiply`, `Apply`) are already provided in your starter file; you wrote them in the previous exercise.

**Pivot transforms.** Scaling and rotation happen about the origin. To act about a pivot `P`, sandwich the operation between two translations:

```
about_P(Op) = Translate(P) * Op * Translate(-P)
              (3rd)        (2nd)  (1st: move P to the origin)
```

**Pipelines.** A drawing step might be "scale, then rotate, then move". Listed in execution order `[S, R, T]`, the combined matrix is `T * R * S`: the list order is the *reverse* of the multiplication order. Build it by repeatedly multiplying new transforms on the **left**.

**Inverses.** Undoing a transform means finding the matrix that maps results back to inputs. A *rigid motion* (rotation + translation only, no scaling) has a cheap closed form: if `M = [R | t]` then `M^-1 = [R^T | -R^T t]`, because the inverse of a rotation matrix is its transpose. No general matrix inversion required.

**Bounds.** After transforming a shape you often need its axis-aligned bounding box to know whether it is on screen or what size an image must be.

Go reminders: `Mat3` is an array, so it is copied everywhere and no function here can accidentally change its argument. `[]Vec2` is a slice, so `TransformAll` must build a **new** slice instead of writing into the one it received.

## Your task

Implement in `solution.go`:

1. `RotationAbout(degrees float64, pivot Vec2) Mat3`: counter-clockwise rotation around `pivot`.
2. `ScalingAbout(sx, sy float64, pivot Vec2) Mat3`: scale around `pivot` (the pivot stays fixed).
3. `TransformAll(m Mat3, pts []Vec2) []Vec2`: every point transformed by `m`, in the same order.
4. `Compose(steps []Mat3) Mat3`: the single matrix that applies `steps[0]` first, then `steps[1]`, and so on. An empty list gives the identity.
5. `InvertRigid(m Mat3) Mat3`: the inverse of a matrix made only from rotations and translations.
6. `BoundingBox(pts []Vec2) Box`: the smallest axis-aligned box containing all points. For an empty list return a box with all four fields `0`.
