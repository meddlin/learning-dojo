package main

import (
	"slices"
	"testing"
)

func TestBFSOnAPath(t *testing.T) {
	g := Graph{{1}, {0, 2}, {1, 3}, {2}}
	Equal(t, BFSOrder(g, 0), []int{0, 1, 2, 3})
	Equal(t, BFSOrder(g, 3), []int{3, 2, 1, 0})
}

func TestBFSOnATreeGoesLevelByLevel(t *testing.T) {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	Equal(t, BFSOrder(g, 0), []int{0, 1, 2, 3, 4, 5})
}

func TestBFSVisitsASharedNeighbourOnce(t *testing.T) {
	g := Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}
	Equal(t, BFSOrder(g, 0), []int{0, 1, 2, 3})
}

func TestBFSIgnoresUnreachableVertices(t *testing.T) {
	g := Graph{{1}, {0}, {3}, {2}}
	Equal(t, BFSOrder(g, 0), []int{0, 1})
	Equal(t, BFSOrder(g, 2), []int{2, 3})
}

func TestBFSFollowsEdgeDirection(t *testing.T) {
	g := Graph{{1}, {2}, {0}, {0}}
	Equal(t, BFSOrder(g, 1), []int{1, 2, 0})
	Equal(t, BFSOrder(g, 3), []int{3, 0, 1, 2})
}

func TestBFSSingleVertex(t *testing.T) {
	Equal(t, BFSOrder(Graph{{}}, 0), []int{0})
}

func TestBFSNeverRepeatsAVertexOnADenseGraph(t *testing.T) {
	const n = 200
	g := make(Graph, n)
	for u := range n {
		for v := range n {
			if u != v {
				g[u] = append(g[u], v)
			}
		}
	}
	order := BFSOrder(g, 7)
	Equal(t, len(order), n)
	Equal(t, order[0], 7)
	sorted := slices.Clone(order)
	slices.Sort(sorted)
	all := make([]int, n)
	for i := range all {
		all[i] = i
	}
	Equal(t, sorted, all)
}
