package main

import "fmt"

type Graph [][]int

// BFSOrder returns the vertices in the order breadth-first search reaches them
// from start. Try each vertex's neighbours in the order they are stored in g[u].
// Only vertices reachable from start appear, each exactly once.
func BFSOrder(g Graph, start int) []int {
	return nil // TODO
}

func main() {
	g := Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}
	fmt.Println(BFSOrder(g, 0))
}
