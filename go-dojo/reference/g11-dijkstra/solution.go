package main

import (
	"container/heap"
	"fmt"
	"math"
	"slices"
)

type Arc struct {
	To int
	W  int64
}

type WGraph [][]Arc

const INF = int64(math.MaxInt64 / 4)

type item struct {
	dist int64
	v    int
}

type minHeap []item

func (h minHeap) Len() int           { return len(h) }
func (h minHeap) Less(i, j int) bool { return h[i].dist < h[j].dist }
func (h minHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *minHeap) Push(x any)        { *h = append(*h, x.(item)) }
func (h *minHeap) Pop() any {
	old := *h
	last := old[len(old)-1]
	*h = old[:len(old)-1]
	return last
}

func run(g WGraph, start int) (dist []int64, parent []int) {
	dist = make([]int64, len(g))
	parent = make([]int, len(g))
	for i := range dist {
		dist[i] = INF
		parent[i] = -1
	}
	dist[start] = 0
	h := &minHeap{{0, start}}
	for h.Len() > 0 {
		cur := heap.Pop(h).(item)
		if cur.dist > dist[cur.v] {
			continue
		}
		for _, a := range g[cur.v] {
			if nd := dist[cur.v] + a.W; nd < dist[a.To] {
				dist[a.To] = nd
				parent[a.To] = cur.v
				heap.Push(h, item{nd, a.To})
			}
		}
	}
	return dist, parent
}

func Dijkstra(g WGraph, start int) []int64 {
	dist, _ := run(g, start)
	return dist
}

func DijkstraPath(g WGraph, start, target int) []int {
	dist, parent := run(g, start)
	if dist[target] >= INF {
		return nil
	}
	var path []int
	for v := target; v != -1; v = parent[v] {
		path = append(path, v)
	}
	slices.Reverse(path)
	return path
}

func main() {
	g := make(WGraph, 4)
	g[0] = []Arc{{1, 4}, {2, 1}}
	g[2] = []Arc{{1, 2}, {3, 7}}
	g[1] = []Arc{{3, 1}}
	fmt.Println(Dijkstra(g, 0))
	fmt.Println(DijkstraPath(g, 0, 3))
}
