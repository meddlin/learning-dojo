package main

import "fmt"

// Graph[u] lists the neighbours of vertex u. Vertices are 0..n-1.
type Graph [][]int

// Edge joins vertex U to vertex V.
type Edge struct{ U, V int }

// BuildGraph makes a graph with n vertices. For each edge {U, V}: add V to g[U];
// if the graph is not directed, also add U to g[V].
// Keep neighbours in the order the edges were given. Inputs contain no self-loops.
func BuildGraph(n int, edges []Edge, directed bool) Graph {
	return nil // TODO
}

// OutDegree is how many edges leave u.
func OutDegree(g Graph, u int) int {
	return -1 // TODO
}

// InDegrees returns, for every vertex, how many edges enter it.
func InDegrees(g Graph) []int {
	return nil // TODO
}

// HasEdge reports whether there is an edge u -> v.
func HasEdge(g Graph, u, v int) bool {
	return false // TODO
}

func main() {
	// Scratch area: press Run to try things out here.
	g := BuildGraph(4, []Edge{{0, 1}, {0, 2}, {2, 3}}, false)
	for u, neighbours := range g {
		fmt.Println(u, neighbours)
	}
}
