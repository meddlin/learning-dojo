package main

import (
	"slices"
	"strings"
	"testing"
)

func TestComponentsOfAnEmptyGraph(t *testing.T) {
	Equal(t, CountComponents(Graph{}), 0)
}

func TestAConnectedGraphIsOneComponent(t *testing.T) {
	g := Graph{{1, 2}, {0, 2}, {0, 1, 3}, {2}}
	Equal(t, CountComponents(g), 1)
}

func TestIsolatedVerticesEachCount(t *testing.T) {
	Equal(t, CountComponents(make(Graph, 5)), 5)
}

func TestMixedComponents(t *testing.T) {
	// {0,1}, {2,3,4}, {5}
	g := Graph{{1}, {0}, {3}, {2, 4}, {3}, {}}
	Equal(t, CountComponents(g), 3)
}

func TestComponentsInALongPathAndManyPairs(t *testing.T) {
	const n = 1000
	path := make(Graph, n)
	for i := 0; i+1 < n; i++ {
		path[i] = append(path[i], i+1)
		path[i+1] = append(path[i+1], i)
	}
	Equal(t, CountComponents(path), 1)
	pairs := make(Graph, n)
	for i := 0; i < n; i += 2 {
		pairs[i] = append(pairs[i], i+1)
		pairs[i+1] = append(pairs[i+1], i)
	}
	Equal(t, CountComponents(pairs), n/2)
}

func TestIslandsBasic(t *testing.T) {
	m := []string{"11000", "11000", "00100", "00011"}
	Equal(t, NumIslands(m), 3)
	Equal(t, LargestIsland(m), 4)
}

func TestDiagonalsDoNotConnect(t *testing.T) {
	m := []string{"10", "01"}
	Equal(t, NumIslands(m), 2)
	Equal(t, LargestIsland(m), 1)
}

func TestNoLandAndEmptyGrids(t *testing.T) {
	Equal(t, NumIslands([]string{"000", "000"}), 0)
	Equal(t, LargestIsland([]string{"000", "000"}), 0)
	Equal(t, NumIslands(nil), 0)
	Equal(t, LargestIsland(nil), 0)
}

func TestAllLandIsOneIsland(t *testing.T) {
	m := make([]string, 10)
	for r := range m {
		m[r] = strings.Repeat("1", 7)
	}
	Equal(t, NumIslands(m), 1)
	Equal(t, LargestIsland(m), 70)
}

func TestTheInputGridIsNotModified(t *testing.T) {
	m := []string{"110", "001", "101"}
	before := slices.Clone(m)
	NumIslands(m)
	LargestIsland(m)
	Equal(t, m, before)
}

func TestABigSerpentineIsland(t *testing.T) {
	const n = 150
	m := make([]string, n)
	land := 0
	for r := range m {
		row := []byte(strings.Repeat("1", n))
		if r%2 == 1 {
			for c := 0; c < n-1; c++ {
				row[c] = '0'
			}
		}
		land += strings.Count(string(row), "1")
		m[r] = string(row)
	}
	// Rows 0, 2, 4... are land, joined by the last column: a single snake.
	Equal(t, NumIslands(m), 1)
	Equal(t, LargestIsland(m), land)
}
