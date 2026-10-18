package main

import "testing"

func TestBuildGraphUndirectedStoresBothDirections(t *testing.T) {
	g := BuildGraph(4, []Edge{{0, 1}, {0, 2}, {2, 3}}, false)
	Equal(t, g, Graph{{1, 2}, {0}, {0, 3}, {2}})
}

func TestBuildGraphDirectedStoresOneDirection(t *testing.T) {
	g := BuildGraph(4, []Edge{{0, 1}, {0, 2}, {2, 3}}, true)
	Equal(t, g, Graph{{1, 2}, {}, {3}, {}})
}

func TestBuildGraphKeepsIsolatedVertices(t *testing.T) {
	g := BuildGraph(3, nil, false)
	Equal(t, len(g), 3)
	Equal(t, g, Graph{{}, {}, {}})
}

func TestBuildGraphKeepsEdgeOrder(t *testing.T) {
	g := BuildGraph(4, []Edge{{0, 3}, {0, 1}, {0, 2}}, true)
	Equal(t, g[0], []int{3, 1, 2})
}

func TestOutDegreeCountsLeavingEdges(t *testing.T) {
	g := Graph{{1, 2, 3}, {}, {0}, {2, 2}}
	Equal(t, OutDegree(g, 0), 3)
	Equal(t, OutDegree(g, 1), 0)
	Equal(t, OutDegree(g, 2), 1)
	Equal(t, OutDegree(g, 3), 2)
}

func TestInDegreesCountsEnteringEdges(t *testing.T) {
	g := Graph{{1, 2}, {}, {1}}
	Equal(t, InDegrees(g), []int{0, 2, 1})
}

func TestInDegreesOfEmptyAndIsolated(t *testing.T) {
	Equal(t, InDegrees(Graph{}), []int{})
	Equal(t, InDegrees(Graph{{}, {}}), []int{0, 0})
}

func TestHasEdgeRespectsDirection(t *testing.T) {
	g := BuildGraph(3, []Edge{{0, 1}, {1, 2}}, true)
	True(t, HasEdge(g, 0, 1))
	False(t, HasEdge(g, 1, 0))
	True(t, HasEdge(g, 1, 2))
	False(t, HasEdge(g, 0, 2))
}
