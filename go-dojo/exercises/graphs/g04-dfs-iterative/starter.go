package main

import "fmt"

type Graph [][]int

// DFSOrderIterative returns the depth-first pre-order from start using an explicit
// stack (a slice), with no recursion.
// The order must match the recursive version exactly: g[u]'s neighbours are tried in stored order.
func DFSOrderIterative(g Graph, start int) []int {
	return nil // TODO
}

func main() {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	fmt.Println(DFSOrderIterative(g, 0))
}
