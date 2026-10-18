# Inside a slice: length, capacity, aliasing

## Concept

A slice value is a three-word header: a **pointer** to an element of an array, a **length** and a **capacity**.

```
s := make([]int, 3, 5)           backing array: [ 0 0 0 _ _ ]
  ptr ──────────────────────────────▲
  len = 3, cap = 5
```

- `len(s)` is how many elements you can index; `cap(s)` is how far the slice could grow without reallocating.
- Slicing `t := s[1:3]` builds a new header over the **same array**. Writing `t[0] = 9` changes `s[1]`.
- `append(s, x)` writes into the spare capacity if there is room (and then every slice sharing that array sees it!), otherwise it allocates a bigger array, copies, and returns a header on the new one. Always use the result: `s = append(s, x)`.
- A **full slice expression** `s[low:high:max]` limits the capacity too, which is how you stop an `append` from trampling the elements after `high`.
- Passing a slice to a function copies the *header*, not the array: the callee can change your elements, but `append` inside it does not change your length.

```go
a := []int{1, 2, 3, 4}
b := a[:2]              // len 2, cap 4, shares a's array
b = append(b, 99)       // fits in capacity: overwrites a[2]!
fmt.Println(a)          // [1 2 99 4]
c := a[:2:2]            // len 2, cap 2
c = append(c, 7)        // must reallocate: a is untouched
```

Aliasing is the source of most slice bugs, and also of Go's efficiency: in-place algorithms need no allocation. The classic in-place filter, `out := xs[:0]` and append the survivors, relies on exactly this.

## Your task

Implement in `solution.go`:

1. `ReverseInPlace(xs []int)`: reverse `xs` using two indices that walk toward each other (no new slice). Works for empty and single-element slices.
2. `PartitionEvens(xs []int) int`: rearrange `xs` in place so all even numbers come before all odd ones (order within each group does not matter). Return the index of the first odd number, or `len(xs)` if there are none.
3. `FilterInPlace(xs []int, keep func(int) bool) []int`: keep only the elements for which `keep` is true, preserving order, **reusing `xs`'s memory** (no allocation). Return the shortened slice.
4. `Clip(xs []int, n int) []int`: the first `n` elements of `xs` (`0 <= n <= len(xs)`), with capacity also limited to `n`, so appending to the result never overwrites `xs`.
5. `GrowthCaps(n int) []int`: append `n` ints one at a time to an empty slice and return each *distinct capacity* you observed, in order.
