package main

import "fmt"

type Graph [][]int

// BFSDist returns dist where dist[v] is the fewest edges from start to v,
// or -1 if v is unreachable.
func BFSDist(g Graph, start int) []int {
	return nil // TODO
}

// ShortestPath returns one shortest path from start to target, both included.
// Return nil if target is unreachable; return []int{start} if start == target.
func ShortestPath(g Graph, start, target int) []int {
	return nil // TODO
}

func main() {
	g := Graph{{1}, {0, 2}, {1, 3}, {2}}
	fmt.Println(BFSDist(g, 0))
	fmt.Println(ShortestPath(g, 0, 3))
}
