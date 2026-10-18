package main

import (
	"slices"
	"testing"
)

func TestEvens(t *testing.T) {
	Equal(t, Evens([]int{1, 2, 3, 4, 5, 6}), []int{2, 4, 6})
	Equal(t, Evens([]int{-2, -1, 0}), []int{-2, 0})
	Equal(t, len(Evens([]int{1, 3, 5})), 0)
	Equal(t, len(Evens(nil)), 0)
}

func TestReversed(t *testing.T) {
	Equal(t, Reversed([]int{1, 2, 3}), []int{3, 2, 1})
	Equal(t, Reversed([]int{7}), []int{7})
	Equal(t, len(Reversed(nil)), 0)
}

func TestReversedLeavesTheInputAlone(t *testing.T) {
	xs := []int{1, 2, 3, 4}
	Reversed(xs)
	Equal(t, xs, []int{1, 2, 3, 4})
}

func TestChunk(t *testing.T) {
	Equal(t, Chunk([]int{1, 2, 3, 4, 5}, 2), [][]int{{1, 2}, {3, 4}, {5}})
	Equal(t, Chunk([]int{1, 2, 3, 4}, 2), [][]int{{1, 2}, {3, 4}})
	Equal(t, Chunk([]int{1, 2}, 5), [][]int{{1, 2}})
	Equal(t, len(Chunk(nil, 3)), 0)
}

func TestChunkWithABadSize(t *testing.T) {
	Equal(t, len(Chunk([]int{1, 2, 3}, 0)), 0)
	Equal(t, len(Chunk([]int{1, 2, 3}, -1)), 0)
}

func TestInsert(t *testing.T) {
	xs := []int{1, 2, 4}
	Equal(t, Insert(xs, 2, 3), []int{1, 2, 3, 4})
	Equal(t, Insert(xs, 0, 0), []int{0, 1, 2, 4})
	Equal(t, Insert(xs, 3, 5), []int{1, 2, 4, 5})
	Equal(t, Insert(nil, 0, 9), []int{9})
}

func TestInsertLeavesTheInputAlone(t *testing.T) {
	xs := make([]int, 3, 10) // spare capacity: a careless append would write into it
	copy(xs, []int{1, 2, 4})
	got := Insert(xs, 2, 3)
	Equal(t, got, []int{1, 2, 3, 4})
	Equal(t, xs, []int{1, 2, 4})
	Equal(t, xs[:4], []int{1, 2, 4, 0}, "the spare capacity behind xs must not be written to")
}

func TestRemove(t *testing.T) {
	xs := []int{1, 2, 3, 4}
	Equal(t, Remove(xs, 0), []int{2, 3, 4})
	Equal(t, Remove(xs, 2), []int{1, 2, 4})
	Equal(t, Remove(xs, 3), []int{1, 2, 3})
	Equal(t, len(Remove([]int{5}, 0)), 0)
}

func TestRemoveLeavesTheInputAlone(t *testing.T) {
	xs := []int{1, 2, 3, 4}
	before := slices.Clone(xs)
	Remove(xs, 1)
	Equal(t, xs, before)
}
