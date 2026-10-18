# Sorting and searching

## Concept

The `slices` package (Go 1.21+) covers most day-to-day needs:

```go
slices.Sort(xs)                                  // ascending, for ordered types
slices.SortFunc(people, func(a, b Person) int {  // any order you can compare
	return cmp.Compare(a.Age, b.Age)
})
slices.SortStableFunc(...)                       // equal elements keep their relative order
slices.BinarySearch(sorted, target)              // (index, found)
slices.Clone(xs); slices.Reverse(xs); slices.Contains(xs, v); slices.Index(xs, v)
```

A **comparator** returns a negative number if `a` sorts before `b`, zero if they are equivalent, positive if after. `cmp.Compare(x, y)` does that for ordered types, and `cmp.Or(a, b, ...)` returns its first non-zero argument, a tidy way to chain tie-breakers. Sorting is O(n log n). A sort is **stable** if equal elements keep their input order: sort by city, then (stably) by age to get "by age, ties by city".

Remember that `slices.Sort...` sorts **in place**, so it reorders the caller's slice (the array is shared). Clone first when the input must stay untouched.

**Binary search** finds a value in a *sorted* slice in O(log n) by halving a window. The clean way to write it is the **lower bound**: keep a half-open window `[lo, hi)`, and an invariant "everything before `lo` is `< target`, everything from `hi` on is `>= target`". When the window closes, `lo` is the first index with `xs[lo] >= target`, which doubles as the insertion point. Off-by-one bugs vanish once you state the invariant.

**Merging** two sorted lists is the engine of merge sort: keep an index in each, repeatedly take the smaller head. O(n + m).

This exercise asks you to write the search and the merge by hand (the standard library has them; knowing the invariant is the point) and to use the library for the sorts.

## Your task

`Person` is provided. Implement in `solution.go`:

1. `SortByLength(words []string) []string`: a **new** slice, shortest words first; words of equal length keep their original relative order. The input is unchanged.
2. `SortPeople(people []Person)`: sort **in place** by age, oldest first; people of the same age by name, A to Z.
3. `LowerBound(xs []int, target int) int`: for ascending `xs`, the first index `i` with `xs[i] >= target`, or `len(xs)` if there is none. O(log n), written by hand.
4. `BinarySearch(xs []int, target int) int`: for ascending `xs`, an index holding `target`, or -1 (use `LowerBound`).
5. `MergeSorted(a, b []int) []int`: merge two ascending slices into a new ascending slice in O(n + m).
