package main

import "fmt"

type Graph [][]int

// TopoOrder returns a topological order of all vertices of a directed graph
// (every edge u -> v has u before v), or nil if the graph has a cycle.
func TopoOrder(g Graph) []int {
	return nil // TODO
}

// CanFinish reports whether all numCourses courses can be completed. A pair
// {a, b} means: to take course a you must first take course b.
func CanFinish(numCourses int, prereqs [][2]int) bool {
	return false // TODO
}

func main() {
	g := Graph{{1, 2}, {3}, {3}, {}}
	fmt.Println(TopoOrder(g))
	fmt.Println(CanFinish(2, [][2]int{{1, 0}, {0, 1}}))
}
