package main

import "testing"

// chkIsTopological reports whether order contains every vertex exactly once and all edges go forward.
func chkIsTopological(g Graph, order []int) bool {
	n := len(g)
	if len(order) != n {
		return false
	}
	pos := make([]int, n)
	for i := range pos {
		pos[i] = -1
	}
	for i, v := range order {
		if v < 0 || v >= n || pos[v] != -1 {
			return false
		}
		pos[v] = i
	}
	for u := range g {
		for _, v := range g[u] {
			if pos[u] >= pos[v] {
				return false
			}
		}
	}
	return true
}

func TestChainHasExactlyOneOrder(t *testing.T) {
	g := Graph{{1}, {2}, {3}, {}}
	Equal(t, TopoOrder(g), []int{0, 1, 2, 3})
}

func TestDiamond(t *testing.T) {
	g := Graph{{1, 2}, {3}, {3}, {}}
	o := TopoOrder(g)
	True(t, chkIsTopological(g, o), "not a topological order: %v", o)
	Equal(t, o[0], 0)
	Equal(t, o[len(o)-1], 3)
}

func TestIndependentVerticesAllAppear(t *testing.T) {
	g := make(Graph, 5)
	o := TopoOrder(g)
	True(t, chkIsTopological(g, o), "not a topological order: %v", o)
}

func TestEdgesListedAgainstTheNumbering(t *testing.T) {
	// 4 -> 3 -> 2 -> 1 -> 0
	g := Graph{{}, {0}, {1}, {2}, {3}}
	Equal(t, TopoOrder(g), []int{4, 3, 2, 1, 0})
}

func TestCycleGivesEmptyResult(t *testing.T) {
	g := Graph{{1}, {2}, {0}}
	Equal(t, len(TopoOrder(g)), 0)
}

func TestCycleHiddenBehindAValidPrefix(t *testing.T) {
	// 0 -> 1 -> 2 -> 3 -> 1
	g := Graph{{1}, {2}, {3}, {1}}
	Equal(t, len(TopoOrder(g)), 0)
}

func TestSelfLoopIsACycle(t *testing.T) {
	g := Graph{{0}}
	Equal(t, len(TopoOrder(g)), 0)
}

func TestAWideLayeredDAG(t *testing.T) {
	// 6 layers of 30 vertices, every vertex points at every vertex in the next layer.
	const L, W = 6, 30
	g := make(Graph, L*W)
	for l := 0; l+1 < L; l++ {
		for a := range W {
			for b := range W {
				g[l*W+a] = append(g[l*W+a], (l+1)*W+b)
			}
		}
	}
	True(t, chkIsTopological(g, TopoOrder(g)), "not a topological order")
}

func TestCoursesThatCanBeFinished(t *testing.T) {
	True(t, CanFinish(2, [][2]int{{1, 0}}))
	True(t, CanFinish(4, [][2]int{{1, 0}, {2, 0}, {3, 1}, {3, 2}}))
	True(t, CanFinish(3, nil))
	True(t, CanFinish(0, nil))
}

func TestCoursesThatCannotBeFinished(t *testing.T) {
	False(t, CanFinish(2, [][2]int{{1, 0}, {0, 1}}))
	False(t, CanFinish(4, [][2]int{{1, 0}, {2, 1}, {3, 2}, {1, 3}}))
	False(t, CanFinish(1, [][2]int{{0, 0}}))
}
