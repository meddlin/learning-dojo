package main

import "fmt"

type Graph [][]int

// HasCycleUndirected reports whether a simple undirected graph contains a cycle.
// (No self-loops or repeated edges; each edge is listed in both directions.)
func HasCycleUndirected(g Graph) bool {
	return false // TODO
}

// HasCycleDirected reports whether a directed graph contains a cycle.
// A self-loop u -> u counts as a cycle.
func HasCycleDirected(g Graph) bool {
	return false // TODO
}

func main() {
	triangle := Graph{{1, 2}, {0, 2}, {0, 1}}
	fmt.Println(HasCycleUndirected(triangle))
	fmt.Println(HasCycleDirected(Graph{{1}, {2}, {}}))
}
