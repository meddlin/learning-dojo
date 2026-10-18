package main

import (
	"cmp"
	"fmt"
	"slices"
)

type WeightedEdge struct {
	U, V int
	W    int64
}

type DSU struct {
	parent []int
	size   []int
	comps  int
}

func NewDSU(n int) *DSU {
	d := &DSU{parent: make([]int, n), size: make([]int, n), comps: n}
	for i := range n {
		d.parent[i] = i
		d.size[i] = 1
	}
	return d
}

func (d *DSU) Find(x int) int {
	if d.parent[x] != x {
		d.parent[x] = d.Find(d.parent[x])
	}
	return d.parent[x]
}

func (d *DSU) Unite(a, b int) bool {
	ra, rb := d.Find(a), d.Find(b)
	if ra == rb {
		return false
	}
	if d.size[ra] < d.size[rb] {
		ra, rb = rb, ra
	}
	d.parent[rb] = ra
	d.size[ra] += d.size[rb]
	d.comps--
	return true
}

func (d *DSU) SizeOf(x int) int {
	return d.size[d.Find(x)]
}

func (d *DSU) Components() int {
	return d.comps
}

func MSTWeight(n int, edges []WeightedEdge) int64 {
	sorted := slices.Clone(edges)
	slices.SortFunc(sorted, func(a, b WeightedEdge) int { return cmp.Compare(a.W, b.W) })
	d := NewDSU(n)
	var total int64
	kept := 0
	for _, e := range sorted {
		if d.Unite(e.U, e.V) {
			total += e.W
			kept++
		}
	}
	if kept < n-1 {
		return -1
	}
	return total
}

func main() {
	d := NewDSU(5)
	d.Unite(0, 1)
	d.Unite(1, 2)
	fmt.Println(d.Find(0) == d.Find(2), d.Components())
}
