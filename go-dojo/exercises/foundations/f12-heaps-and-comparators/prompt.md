# Heaps and container/heap

## Concept

A **binary heap** stores values so that the smallest (or largest) is always at the front: reading it is O(1), inserting and removing are O(log n). That makes it the engine of priority queues, schedulers, "top k" queries and Dijkstra's algorithm.

Go does not ship a ready-made heap type. The `container/heap` package gives you the algorithm, and you supply the storage by implementing five methods:

```go
type IntHeap []int

func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] } // < : smallest first (min-heap)
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) } // adds at the END
func (h *IntHeap) Pop() any {                                    // removes from the END
	old := *h
	x := old[len(old)-1]
	*h = old[:len(old)-1]
	return x
}

h := &IntHeap{5, 2, 8}
heap.Init(h)             // establish the heap property
heap.Push(h, 1)          // NOT h.Push: heap.Push re-sorts afterwards
smallest := heap.Pop(h).(int)   // returns 1; (*h)[0] is always the minimum
```

The classic confusion: your `Push` and `Pop` methods only append and trim the slice; the `heap.Push` / `heap.Pop` *functions* call them and then restore the order. Always go through the package functions.

To flip to a **max-heap**, flip `Less` (`h[i] > h[j]`). To order structs, make `Less` compare the field you want. Elements are `any`, so you convert back with a type assertion.

Techniques:

- **Top k**: to find the k smallest of n values without sorting everything, keep a *max*-heap of size k. A new value that beats the largest of the current k replaces it. O(n log k).
- **K-way merge**: keep one candidate per sorted list in a min-heap. Pop the smallest, push that list's next element.
- **Running median** with **two heaps**: a max-heap for the lower half and a min-heap for the upper half, balanced in size. The median sits at the tops.
- **Custom orders** (not heaps): `slices.SortFunc` with a comparator; chain tie-breakers with `cmp.Or`.

## Your task

`Pt` is provided. Implement in `solution.go`:

1. `KSmallest(xs []int, k int) []int`: the `k` smallest values in ascending order (`0 <= k <= len(xs)`). Use a heap that never holds more than `k` elements. `xs` is unchanged.
2. `MergeSortedLists(lists [][]int) []int`: merge several individually sorted lists into one sorted list using a min-heap holding one candidate per list.
3. `SortByDistance(points []Pt) []Pt`: a new slice sorted by distance from the origin, nearest first (compare squared distances); ties by `X`, then by `Y`.
4. `MedianTracker`: `NewMedianTracker() *MedianTracker`, `Add(x int)` and `Median() float64` (0 when empty), using two heaps. `Add` and `Median` must be fast: the tests add 100,000 numbers.
