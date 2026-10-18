package main

import (
	"slices"
	"testing"
)

// chkValidPath reports whether p is a walk along real edges from s to t.
func chkValidPath(g Graph, p []int, s, t int) bool {
	if len(p) == 0 || p[0] != s || p[len(p)-1] != t {
		return false
	}
	for i := 0; i+1 < len(p); i++ {
		if !slices.Contains(g[p[i]], p[i+1]) {
			return false
		}
	}
	return true
}

func TestDistancesOnAPath(t *testing.T) {
	g := Graph{{1}, {0, 2}, {1, 3}, {2}}
	Equal(t, BFSDist(g, 0), []int{0, 1, 2, 3})
	Equal(t, BFSDist(g, 2), []int{2, 1, 0, 1})
}

func TestDistancesPreferTheShortcut(t *testing.T) {
	// 0-1-2-3-4 plus a shortcut 0-4.
	g := Graph{{1, 4}, {0, 2}, {1, 3}, {2, 4}, {3, 0}}
	Equal(t, BFSDist(g, 0), []int{0, 1, 2, 2, 1})
}

func TestUnreachableVerticesAreMinusOne(t *testing.T) {
	g := Graph{{1}, {0}, {3}, {2}, {}}
	Equal(t, BFSDist(g, 0), []int{0, 1, -1, -1, -1})
}

func TestDistancesRespectDirection(t *testing.T) {
	g := Graph{{1}, {2}, {}, {0}}
	Equal(t, BFSDist(g, 0), []int{0, 1, 2, -1})
	Equal(t, BFSDist(g, 3), []int{1, 2, 3, 0})
}

func TestPathToSelfIsJustTheStart(t *testing.T) {
	g := Graph{{1}, {0}}
	Equal(t, ShortestPath(g, 1, 1), []int{1})
}

func TestPathOnALineIsUnique(t *testing.T) {
	g := Graph{{1}, {0, 2}, {1, 3}, {2, 4}, {3}}
	Equal(t, ShortestPath(g, 0, 4), []int{0, 1, 2, 3, 4})
	Equal(t, ShortestPath(g, 4, 1), []int{4, 3, 2, 1})
}

func TestPathIsEmptyWhenUnreachable(t *testing.T) {
	g := Graph{{1}, {0}, {3}, {2}}
	Equal(t, len(ShortestPath(g, 0, 3)), 0)
}

func TestPathTakesTheShortcut(t *testing.T) {
	g := Graph{{1, 4}, {0, 2}, {1, 3}, {2, 4}, {3, 0}}
	p := ShortestPath(g, 0, 3)
	True(t, chkValidPath(g, p, 0, 3), "path %v is not a walk from 0 to 3", p)
	Equal(t, len(p), 3) // 0 -> 4 -> 3
}

func TestPathHasTheRightLengthInADiamondChain(t *testing.T) {
	// Layers of two parallel vertices: 0 -> {1,2} -> 3 -> {4,5} -> 6 ...
	const layers = 40
	n := 1 + layers*3
	g := make(Graph, n)
	prev := 0
	for range layers {
		a, b, join := prev+1, prev+2, prev+3
		g[prev] = append(g[prev], a, b)
		g[a] = append(g[a], join)
		g[b] = append(g[b], join)
		prev = join
	}
	Equal(t, BFSDist(g, 0)[prev], layers*2)
	p := ShortestPath(g, 0, prev)
	True(t, chkValidPath(g, p, 0, prev), "not a valid path")
	Equal(t, len(p), layers*2+1)
}
