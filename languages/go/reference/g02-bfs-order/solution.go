package main

import "fmt"

type Graph [][]int

func BFSOrder(g Graph, start int) []int {
	visited := make([]bool, len(g))
	visited[start] = true
	queue := []int{start}
	var order []int
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		order = append(order, u)
		for _, v := range g[u] {
			if !visited[v] {
				visited[v] = true
				queue = append(queue, v)
			}
		}
	}
	return order
}

func main() {
	g := Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}
	fmt.Println(BFSOrder(g, 0))
}
