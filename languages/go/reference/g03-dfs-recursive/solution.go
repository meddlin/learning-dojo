package main

import "fmt"

type Graph [][]int

func DFSOrder(g Graph, start int) []int {
	visited := make([]bool, len(g))
	var order []int
	var visit func(u int)
	visit = func(u int) {
		visited[u] = true
		order = append(order, u)
		for _, v := range g[u] {
			if !visited[v] {
				visit(v)
			}
		}
	}
	visit(start)
	return order
}

func Reachable(g Graph, from, to int) bool {
	for _, v := range DFSOrder(g, from) {
		if v == to {
			return true
		}
	}
	return false
}

func main() {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	fmt.Println(DFSOrder(g, 0))
}
