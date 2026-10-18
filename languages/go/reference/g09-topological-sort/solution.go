package main

import "fmt"

type Graph [][]int

func TopoOrder(g Graph) []int {
	indeg := make([]int, len(g))
	for _, neighbours := range g {
		for _, v := range neighbours {
			indeg[v]++
		}
	}
	var queue []int
	for v, d := range indeg {
		if d == 0 {
			queue = append(queue, v)
		}
	}
	var order []int
	for len(queue) > 0 {
		u := queue[0]
		queue = queue[1:]
		order = append(order, u)
		for _, v := range g[u] {
			indeg[v]--
			if indeg[v] == 0 {
				queue = append(queue, v)
			}
		}
	}
	if len(order) < len(g) {
		return nil
	}
	return order
}

func CanFinish(numCourses int, prereqs [][2]int) bool {
	g := make(Graph, numCourses)
	for _, p := range prereqs {
		a, b := p[0], p[1]
		g[b] = append(g[b], a)
	}
	return len(TopoOrder(g)) == numCourses
}

func main() {
	g := Graph{{1, 2}, {3}, {3}, {}}
	fmt.Println(TopoOrder(g))
	fmt.Println(CanFinish(2, [][2]int{{1, 0}, {0, 1}}))
}
