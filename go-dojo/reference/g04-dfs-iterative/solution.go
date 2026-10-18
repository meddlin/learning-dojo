package main

import "fmt"

type Graph [][]int

func DFSOrderIterative(g Graph, start int) []int {
	visited := make([]bool, len(g))
	stack := []int{start}
	var order []int
	for len(stack) > 0 {
		u := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		if visited[u] {
			continue
		}
		visited[u] = true
		order = append(order, u)
		for i := len(g[u]) - 1; i >= 0; i-- {
			if !visited[g[u][i]] {
				stack = append(stack, g[u][i])
			}
		}
	}
	return order
}

func main() {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	fmt.Println(DFSOrderIterative(g, 0))
}
