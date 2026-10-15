# Transform pipelines

## Concept

Now put the 3x3 matrices to work on real tasks. The building blocks (`identity3`, `translation`, `scaling`, `rotation`, `multiply`, `apply`) are already provided in your starter file; you wrote them in the previous exercise.

**Pivot transforms.** Scaling and rotation happen about the origin. To act about a pivot `P`, sandwich the operation between two translations:

```
about_P(Op) = Translate(P) * Op * Translate(-P)
              (3rd)        (2nd)  (1st: move P to the origin)
```

**Pipelines.** A drawing step might be "scale, then rotate, then move". Listed in execution order `[S, R, T]`, the combined matrix is `T * R * S`: the list order is the *reverse* of the multiplication order. Build it by repeatedly multiplying new transforms on the **left**.

**Inverses.** Undoing a transform means finding the matrix that maps results back to inputs. A *rigid motion* (rotation + translation only, no scaling) has a cheap closed form: if `M = [R | t]` then `M^-1 = [R^T | -R^T t]`, because the inverse of a rotation matrix is its transpose. No general matrix inversion required.

**Bounds.** After transforming a shape you often need its axis-aligned bounding box to know whether it is on screen or what size an image must be.

## Your task

Implement in `solution.cpp`:

1. `Mat3 rotation_about(double degrees, Vec2 pivot)`: counter-clockwise rotation around `pivot`.
2. `Mat3 scaling_about(double sx, double sy, Vec2 pivot)`: scale around `pivot` (the pivot stays fixed).
3. `std::vector<Vec2> transform_all(const Mat3& m, const std::vector<Vec2>& pts)`: every point transformed by `m`, in the same order.
4. `Mat3 compose(const std::vector<Mat3>& steps)`: the single matrix that applies `steps[0]` first, then `steps[1]`, and so on. An empty list gives the identity.
5. `Mat3 invert_rigid(const Mat3& m)`: the inverse of a matrix made only from rotations and translations.
6. `Box bounding_box(const std::vector<Vec2>& pts)`: the smallest axis-aligned box containing all points. For an empty list return a box with all four fields `0`.
