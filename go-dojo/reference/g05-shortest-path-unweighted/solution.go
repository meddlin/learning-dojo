package main

import (
	"fmt"
	"slices"
)

type Graph [][]int

func bfsFrom(g Graph, start int) (dist, parent []int) {
	dist = make([]int, len(g))
	parent = make([]int, len(g))
	for i := range dist {
		dist[i] = -1
		parent[i] = -1
	}
	dist[start] = 0
	queue := []int{start}
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		for _, v := range g[u] {
			if dist[v] == -1 {
				dist[v] = dist[u] + 1
				parent[v] = u
				queue = append(queue, v)
			}
		}
	}
	return dist, parent
}

func BFSDist(g Graph, start int) []int {
	dist, _ := bfsFrom(g, start)
	return dist
}

func ShortestPath(g Graph, start, target int) []int {
	dist, parent := bfsFrom(g, start)
	if dist[target] == -1 {
		return nil
	}
	var path []int
	for v := target; v != -1; v = parent[v] {
		path = append(path, v)
	}
	slices.Reverse(path)
	return path
}

func main() {
	g := Graph{{1}, {0, 2}, {1, 3}, {2}}
	fmt.Println(BFSDist(g, 0))
	fmt.Println(ShortestPath(g, 0, 3))
}
