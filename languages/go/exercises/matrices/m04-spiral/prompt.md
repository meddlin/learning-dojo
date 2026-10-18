# Spiral traversal

## Concept

Reading a matrix in a spiral (outer ring clockwise, then the next ring in, and so on) is a standard exercise in careful bookkeeping. The cleanest solution tracks four moving **boundaries**:

```
top  -->  1  2  3  4
          5  6  7  8
          9 10 11 12  <-- bottom
          ^           ^
         left        right
```

One ring = four straight walks, each followed by pulling a boundary inward:

1. along `top` from `left` to `right`, then `top++`
2. down `right` from `top` to `bottom`, then `right--`
3. along `bottom` from `right` to `left`, then `bottom--` *(only if `top <= bottom`)*
4. up `left` from `bottom` to `top`, then `left++` *(only if `left <= right`)*

Those two guards are the heart of the problem. Without them a 1 x N or N x 1 matrix is walked twice. Whenever an algorithm shrinks a region from several sides, ask yourself: *can the region become empty halfway through this iteration?*

The same walk run in reverse (writing counters instead of reading values) *generates* a spiral matrix.

## Your task

With `Matrix = [][]int`, implement:

1. `SpiralOrder(m Matrix) []int`: all cells in clockwise spiral order starting at the top-left. Works for any rectangle, including a single row or column, and the empty matrix (returns an empty slice).
2. `SpiralMatrix(n int) Matrix`: the `n x n` matrix filled with `1, 2, ..., n*n` along a clockwise spiral from the top-left. `n = 0` gives an empty matrix.

For example `SpiralMatrix(3)` is `{{1,2,3},{8,9,4},{7,6,5}}`.
