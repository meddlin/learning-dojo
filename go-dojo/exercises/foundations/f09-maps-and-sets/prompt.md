# Maps and sets

## Concept

A Go **map** is a hash table with average O(1) insert, lookup and delete. Almost every "find a pair", "have I seen this", "count these", "group by" problem becomes a single O(n) pass once a map is allowed.

```go
seen := make(map[int]bool)               // or map[int]struct{} for a pure set
counts := map[string]int{}
counts["a"]++                            // missing key reads as the zero value
v, ok := counts["zzz"]                   // ok == false: the key is absent
delete(counts, "a")
```

Things to remember:

- **Iteration order is random.** Never build output by ranging over a map unless you sort afterwards, or you will write a test that passes once in a hundred runs.
- **A nil map can be read but not written.** `var m map[string]int; m["a"] = 1` panics. Create maps with `make` or a literal.
- **Keys must be comparable**: ints, strings, bools, arrays, and structs made of those. Slices, maps and functions cannot be keys. A small struct such as `Point{X, Y}` makes an excellent grid-cell key.
- **Sets** are idiomatically `map[T]struct{}`. You can give the set a named *generic* type and attach methods to it: `type Set[T comparable] map[T]struct{}`. `comparable` is the constraint meaning "usable with `==` and as a map key".
- Maps are **reference-like**: passing a map to a function shares it (like slices, unlike arrays and structs).

## Your task

`Set`, `Point` and `NewSet`'s signature are provided. Implement in `solution.go`:

1. The `Set` methods `Add(v T)`, `Has(v T) bool`, `Remove(v T)` and `Len() int`; and `NewSet(items ...T) Set[T]`.
2. `Union(a, b Set[T]) Set[T]` and `Intersection(a, b Set[T]) Set[T]`: new sets; the inputs are not changed.
3. `FirstDuplicate(xs []int) (int, bool)`: scanning left to right, the first value that has already appeared earlier. For `3 1 4 1 5 3` that is `1`. If all values are distinct, return `0, false`.
4. `TwoSum(nums []int, target int) (i, j int, ok bool)`: indices with `i < j` and `nums[i] + nums[j] == target`, found in one pass; `ok` is false if there are none. (Tests only use inputs with a single answer.)
5. `GroupAnagrams(words []string) [][]string`: group words that are anagrams of each other. Groups appear in order of the first word of each group, and words keep their input order within a group.
6. `CountPoints(pts []Point) map[Point]int`: how many times each point occurs.
