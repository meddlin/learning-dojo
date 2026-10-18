package main

import (
	"cmp"
	"container/heap"
	"fmt"
	"slices"
)

type Pt struct{ X, Y int }

// intHeap is a min-heap, or a max-heap when max is set.
type intHeap struct {
	data []int
	max  bool
}

func (h intHeap) Len() int { return len(h.data) }
func (h intHeap) Less(i, j int) bool {
	if h.max {
		return h.data[i] > h.data[j]
	}
	return h.data[i] < h.data[j]
}
func (h intHeap) Swap(i, j int) { h.data[i], h.data[j] = h.data[j], h.data[i] }
func (h *intHeap) Push(x any)   { h.data = append(h.data, x.(int)) }
func (h *intHeap) Pop() any {
	last := h.data[len(h.data)-1]
	h.data = h.data[:len(h.data)-1]
	return last
}
func (h intHeap) top() int { return h.data[0] }

func KSmallest(xs []int, k int) []int {
	if k == 0 {
		return nil
	}
	h := &intHeap{max: true}
	for _, x := range xs {
		heap.Push(h, x)
		if h.Len() > k {
			heap.Pop(h)
		}
	}
	out := make([]int, h.Len())
	for i := len(out) - 1; i >= 0; i-- {
		out[i] = heap.Pop(h).(int)
	}
	return out
}

type candidate struct {
	val, list, pos int
}

type candHeap []candidate

func (h candHeap) Len() int           { return len(h) }
func (h candHeap) Less(i, j int) bool { return h[i].val < h[j].val }
func (h candHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *candHeap) Push(x any)        { *h = append(*h, x.(candidate)) }
func (h *candHeap) Pop() any {
	old := *h
	last := old[len(old)-1]
	*h = old[:len(old)-1]
	return last
}

func MergeSortedLists(lists [][]int) []int {
	h := &candHeap{}
	total := 0
	for i, l := range lists {
		total += len(l)
		if len(l) > 0 {
			*h = append(*h, candidate{l[0], i, 0})
		}
	}
	heap.Init(h)
	out := make([]int, 0, total)
	for h.Len() > 0 {
		c := heap.Pop(h).(candidate)
		out = append(out, c.val)
		if next := c.pos + 1; next < len(lists[c.list]) {
			heap.Push(h, candidate{lists[c.list][next], c.list, next})
		}
	}
	return out
}

func SortByDistance(points []Pt) []Pt {
	out := slices.Clone(points)
	dist := func(p Pt) int { return p.X*p.X + p.Y*p.Y }
	slices.SortFunc(out, func(a, b Pt) int {
		return cmp.Or(cmp.Compare(dist(a), dist(b)), cmp.Compare(a.X, b.X), cmp.Compare(a.Y, b.Y))
	})
	return out
}

type MedianTracker struct {
	low  *intHeap // max-heap: the smaller half
	high *intHeap // min-heap: the larger half
}

func NewMedianTracker() *MedianTracker {
	return &MedianTracker{low: &intHeap{max: true}, high: &intHeap{}}
}

func (m *MedianTracker) Add(x int) {
	heap.Push(m.low, x)
	heap.Push(m.high, heap.Pop(m.low))
	if m.high.Len() > m.low.Len() {
		heap.Push(m.low, heap.Pop(m.high))
	}
}

func (m *MedianTracker) Median() float64 {
	switch {
	case m.low.Len() == 0:
		return 0
	case m.low.Len() > m.high.Len():
		return float64(m.low.top())
	default:
		return float64(m.low.top()+m.high.top()) / 2
	}
}

func main() {
	fmt.Println(KSmallest([]int{5, 2, 8, 1, 9}, 3))
}
