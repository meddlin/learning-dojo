package main

import (
	"fmt"
	"slices"
)

type Graph [][]int

type Edge struct{ U, V int }

func BuildGraph(n int, edges []Edge, directed bool) Graph {
	g := make(Graph, n)
	for _, e := range edges {
		g[e.U] = append(g[e.U], e.V)
		if !directed {
			g[e.V] = append(g[e.V], e.U)
		}
	}
	return g
}

func OutDegree(g Graph, u int) int {
	return len(g[u])
}

func InDegrees(g Graph) []int {
	deg := make([]int, len(g))
	for _, neighbours := range g {
		for _, v := range neighbours {
			deg[v]++
		}
	}
	return deg
}

func HasEdge(g Graph, u, v int) bool {
	return slices.Contains(g[u], v)
}

func main() {
	g := BuildGraph(4, []Edge{{0, 1}, {0, 2}, {2, 3}}, false)
	for u, neighbours := range g {
		fmt.Println(u, neighbours)
	}
}
