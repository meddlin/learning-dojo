package main

import "fmt"

type Graph [][]int

// DFSOrder returns the vertices in depth-first pre-order from start, trying
// neighbours in the order stored in g[u]. Record each vertex as you first reach it.
func DFSOrder(g Graph, start int) []int {
	return nil // TODO
}

// Reachable reports whether `to` can be reached from `from` by following edges.
// A vertex reaches itself.
func Reachable(g Graph, from, to int) bool {
	return false // TODO
}

func main() {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	fmt.Println(DFSOrder(g, 0))
}
