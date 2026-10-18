package main

import "testing"

// chkRecursiveDFS is the reference used for comparison.
func chkRecursiveDFS(g Graph, start int) []int {
	seen := make([]bool, len(g))
	var out []int
	var rec func(u int)
	rec = func(u int) {
		seen[u] = true
		out = append(out, u)
		for _, v := range g[u] {
			if !seen[v] {
				rec(v)
			}
		}
	}
	rec(start)
	return out
}

func TestMatchesTheHandComputedOrder(t *testing.T) {
	g := Graph{{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}}
	Equal(t, DFSOrderIterative(g, 0), []int{0, 1, 3, 4, 2, 5})
}

func TestHandlesCyclesAndSharedNeighbours(t *testing.T) {
	g := Graph{{1, 2}, {0, 3}, {0, 3}, {1, 2}}
	Equal(t, DFSOrderIterative(g, 0), []int{0, 1, 3, 2})
}

func TestFollowsDirectedEdges(t *testing.T) {
	g := Graph{{1}, {2}, {0}, {0}}
	Equal(t, DFSOrderIterative(g, 1), []int{1, 2, 0})
}

func TestSingleVertexAndUnreachableParts(t *testing.T) {
	Equal(t, DFSOrderIterative(Graph{{}}, 0), []int{0})
	g := Graph{{1}, {0}, {3}, {2}}
	Equal(t, DFSOrderIterative(g, 0), []int{0, 1})
}

func TestMatchesRecursionOnRandomGraphs(t *testing.T) {
	state := uint32(2024)
	next := func() int {
		state = state*1664525 + 1013904223
		return int(state >> 8)
	}
	for round := range 40 {
		n := 5 + next()%60
		m := next() % (3 * n)
		g := make(Graph, n)
		for range m {
			u, v := next()%n, next()%n
			g[u] = append(g[u], v)
			if round%2 == 0 {
				g[v] = append(g[v], u)
			}
		}
		for start := 0; start < n; start += 7 {
			Equal(t, DFSOrderIterative(g, start), chkRecursiveDFS(g, start), "round %d, start %d", round, start)
		}
	}
}

func TestSurvivesAVeryLongPath(t *testing.T) {
	const n = 500000
	g := make(Graph, n)
	for i := 0; i+1 < n; i++ {
		g[i] = append(g[i], i+1)
	}
	order := DFSOrderIterative(g, 0)
	Equal(t, len(order), n)
	Equal(t, order[len(order)-1], n-1)
}
