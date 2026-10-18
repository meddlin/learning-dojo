package main

import (
	"fmt"
	"math"
)

// Arc is an edge to vertex To with non-negative weight W.
type Arc struct {
	To int
	W  int64
}

// WGraph[u] lists the edges leaving u.
type WGraph [][]Arc

// INF marks "unreachable". It is small enough that INF + a weight cannot overflow.
const INF = int64(math.MaxInt64 / 4)

// Dijkstra returns the shortest distance from start to every vertex (INF if unreachable).
func Dijkstra(g WGraph, start int) []int64 {
	return nil // TODO
}

// DijkstraPath returns a cheapest path start..target inclusive; nil if unreachable.
func DijkstraPath(g WGraph, start, target int) []int {
	return nil // TODO
}

func main() {
	g := make(WGraph, 4)
	g[0] = []Arc{{1, 4}, {2, 1}}
	g[2] = []Arc{{1, 2}, {3, 7}}
	g[1] = []Arc{{3, 1}}
	fmt.Println(Dijkstra(g, 0))
	fmt.Println(DijkstraPath(g, 0, 3))
}
