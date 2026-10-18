# Arrays, slices and append

## Concept

An **array** has a fixed length that is part of its type, and it is a value: copying or passing one copies every element.

```go
var a [3]int            // [0 0 0]
b := [3]int{1, 2, 3}
c := b                  // a full copy
c[0] = 99               // b is unchanged
```

You will use **slices** far more. A slice is a small header (a pointer to an array, a length and a capacity) describing a window onto an array:

```go
s := []int{10, 20, 30, 40, 50}
len(s)          // 5
s[1:3]          // [20 30]  elements 1 and 2: s[low:high], high excluded
s[:2]           // [10 20]
s[3:]           // [40 50]
t := make([]int, 3)       // length 3, all zeros
u := make([]int, 0, 100)  // length 0, room for 100 before it must reallocate
```

`append` adds elements and **returns the new slice**, so always write `s = append(s, x)`. If the capacity is used up, `append` allocates a bigger array and copies; otherwise it writes into the spare room. `append(a, b...)` appends a whole slice. `copy(dst, src)` copies `min(len(dst), len(src))` elements.

The detail that bites everybody once: **slicing does not copy.** `s[1:3]` shares memory with `s`, so writing through one is visible through the other. The next track, Go Foundations, digs into this. For now: when a function must not disturb its caller's data, build a fresh slice (`make` + `copy`, or `slices.Clone`).

A nil slice (`var s []int`) has length 0 and works with `len`, `range` and `append`. You almost never need to initialise a slice to `[]int{}`.

## Your task

Implement in `solution.go`. None of them may modify the slice they are given.

1. `Evens(xs []int) []int`: the even numbers, in order.
2. `Reversed(xs []int) []int`: a new slice with the elements in reverse order.
3. `Chunk(xs []int, size int) [][]int`: split into consecutive pieces of `size` (the last may be shorter). `size <= 0` gives nil.
4. `Insert(xs []int, i, v int) []int`: a new slice with `v` inserted so that it ends up at index `i` (`0 <= i <= len(xs)`).
5. `Remove(xs []int, i int) []int`: a new slice without the element at index `i`.
