package main

import "testing"

func TestDFSDivesBeforeBacktracking(t *testing.T) {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	Equal(t, DFSOrder(g, 0), []int{0, 1, 3, 4, 2, 5})
}

func TestDFSWithACycleVisitsEachVertexOnce(t *testing.T) {
	g := Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}
	Equal(t, DFSOrder(g, 0), []int{0, 1, 3, 2})
}

func TestDFSFollowsDirectedEdges(t *testing.T) {
	g := Graph{{1}, {2}, {0}}
	Equal(t, DFSOrder(g, 0), []int{0, 1, 2})
	Equal(t, DFSOrder(g, 1), []int{1, 2, 0})
}

func TestDFSOnlyReachesTheStartComponent(t *testing.T) {
	g := Graph{{1}, {0}, {3}, {2}}
	Equal(t, DFSOrder(g, 2), []int{2, 3})
}

func TestDFSSingleVertex(t *testing.T) {
	Equal(t, DFSOrder(Graph{{}}, 0), []int{0})
}

func TestDFSHandlesALongPath(t *testing.T) {
	const n = 5000
	g := make(Graph, n)
	for i := 0; i+1 < n; i++ {
		g[i] = append(g[i], i+1)
		g[i+1] = append(g[i+1], i)
	}
	order := DFSOrder(g, 0)
	Equal(t, len(order), n)
	Equal(t, order[0], 0)
	Equal(t, order[len(order)-1], n-1)
}

func TestReachableFollowsDirection(t *testing.T) {
	g := Graph{{1}, {2}, {}}
	True(t, Reachable(g, 0, 2))
	False(t, Reachable(g, 2, 0))
	True(t, Reachable(g, 1, 1))
}

func TestReachableAcrossComponents(t *testing.T) {
	g := Graph{{1}, {0}, {3}, {2}}
	False(t, Reachable(g, 0, 3))
	True(t, Reachable(g, 3, 2))
}
