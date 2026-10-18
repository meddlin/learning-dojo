package main

import "testing"

func TestUndirectedTreeHasNoCycle(t *testing.T) {
	g := Graph{{1, 2}, {0, 3, 4}, {0}, {1}, {1}}
	False(t, HasCycleUndirected(g))
}

func TestUndirectedTriangleIsACycle(t *testing.T) {
	g := Graph{{1, 2}, {0, 2}, {0, 1}}
	True(t, HasCycleUndirected(g))
}

func TestUndirectedSingleEdgeIsNotACycle(t *testing.T) {
	g := Graph{{1}, {0}}
	False(t, HasCycleUndirected(g))
}

func TestUndirectedCycleHiddenInASecondComponent(t *testing.T) {
	// component {0,1,2} is a path; component {3,4,5} is a triangle.
	g := Graph{{1}, {0, 2}, {1}, {4, 5}, {3, 5}, {3, 4}}
	True(t, HasCycleUndirected(g))
}

func TestUndirectedEmptyAndIsolated(t *testing.T) {
	False(t, HasCycleUndirected(Graph{}))
	False(t, HasCycleUndirected(make(Graph, 4)))
}

func TestUndirectedLongCycleAndLongPath(t *testing.T) {
	const n = 500
	path, ring := make(Graph, n), make(Graph, n)
	for i := 0; i+1 < n; i++ {
		path[i] = append(path[i], i+1)
		path[i+1] = append(path[i+1], i)
		ring[i] = append(ring[i], i+1)
		ring[i+1] = append(ring[i+1], i)
	}
	ring[n-1] = append(ring[n-1], 0)
	ring[0] = append(ring[0], n-1)
	False(t, HasCycleUndirected(path))
	True(t, HasCycleUndirected(ring))
}

func TestDirectedSimpleCycle(t *testing.T) {
	g := Graph{{1}, {2}, {0}}
	True(t, HasCycleDirected(g))
}

func TestDirectedDAGWithSharedDescendantIsAcyclic(t *testing.T) {
	// 0->1, 0->2, 1->3, 2->3: vertex 3 is reached twice, but no cycle.
	g := Graph{{1, 2}, {3}, {3}, {}}
	False(t, HasCycleDirected(g))
}

func TestDirectedSelfLoop(t *testing.T) {
	g := Graph{{}, {1}}
	True(t, HasCycleDirected(g))
}

func TestDirectedTwoCycle(t *testing.T) {
	g := Graph{{1}, {0}}
	True(t, HasCycleDirected(g))
}

func TestDirectedCycleUnreachableFromVertexZero(t *testing.T) {
	g := Graph{{1}, {}, {3}, {2}}
	True(t, HasCycleDirected(g))
}

func TestDirectedEmptyAndChain(t *testing.T) {
	False(t, HasCycleDirected(Graph{}))
	const n = 2000
	chain := make(Graph, n)
	for i := 0; i+1 < n; i++ {
		chain[i] = append(chain[i], i+1)
	}
	False(t, HasCycleDirected(chain))
	chain[n-1] = append(chain[n-1], n/2)
	True(t, HasCycleDirected(chain))
}
