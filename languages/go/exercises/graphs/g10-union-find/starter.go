package main

import "fmt"

// WeightedEdge is an undirected edge between U and V with weight W.
type WeightedEdge struct {
	U, V int
	W    int64
}

// DSU is a disjoint-set union over the elements 0..n-1.
type DSU struct {
	parent []int // parent[i] == i means i is a root
	size   []int // size[root] = number of elements in that group
	comps  int   // number of groups
}

// NewDSU makes n groups of one element each.
func NewDSU(n int) *DSU {
	return &DSU{} // TODO
}

// Find returns the root of x's group (use path compression).
func (d *DSU) Find(x int) int {
	return -1 // TODO
}

// Unite merges the groups of a and b (attach the smaller under the larger).
// It reports whether they were in different groups.
func (d *DSU) Unite(a, b int) bool {
	return false // TODO
}

// SizeOf returns how many elements are in x's group.
func (d *DSU) SizeOf(x int) int {
	return -1 // TODO
}

// Components returns the current number of groups.
func (d *DSU) Components() int {
	return -1 // TODO
}

// MSTWeight returns the total weight of a minimum spanning tree (Kruskal), or -1
// if the graph with vertices 0..n-1 is not connected.
func MSTWeight(n int, edges []WeightedEdge) int64 {
	return -2 // TODO
}

func main() {
	d := NewDSU(5)
	d.Unite(0, 1)
	d.Unite(1, 2)
	fmt.Println(d.Find(0) == d.Find(2), d.Components())
}
