package main

import (
	"strings"
	"testing"
)

func TestNeighborsInTheMiddleFollowTheOrder(t *testing.T) {
	g := []string{"...", "...", "..."}
	Equal(t, Neighbors(g, 1, 1), []Cell{{0, 1}, {1, 2}, {2, 1}, {1, 0}})
}

func TestNeighborsStayInsideTheGrid(t *testing.T) {
	g := []string{"...", "...", "..."}
	Equal(t, Neighbors(g, 0, 0), []Cell{{0, 1}, {1, 0}})
	Equal(t, Neighbors(g, 2, 2), []Cell{{1, 2}, {2, 1}})
	Equal(t, Neighbors(g, 0, 2), []Cell{{1, 2}, {0, 1}})
}

func TestNeighborsSkipWalls(t *testing.T) {
	g := []string{".#.", "#.#", ".#."}
	Equal(t, Neighbors(g, 1, 1), []Cell{})
	h := []string{"S#E", "...", "###"}
	Equal(t, Neighbors(h, 1, 1), []Cell{{1, 2}, {1, 0}})
}

func TestNeighborsTreatSAndEAsFloor(t *testing.T) {
	g := []string{"SE"}
	Equal(t, Neighbors(g, 0, 0), []Cell{{0, 1}})
	Equal(t, Neighbors(g, 0, 1), []Cell{{0, 0}})
}

func TestAdjacentStartAndExit(t *testing.T) {
	Equal(t, MazeSteps([]string{"SE"}), 1)
}

func TestOpenRoomIsManhattanDistance(t *testing.T) {
	g := []string{
		"S....",
		".....",
		"....E",
	}
	Equal(t, MazeSteps(g), 6)
}

func TestWallsForceADetour(t *testing.T) {
	g := []string{
		"S.#..",
		".##.E",
		"....#",
	}
	// Down twice, right three times, then up and right: 7 moves.
	Equal(t, MazeSteps(g), 7)
}

func TestAClassicMaze(t *testing.T) {
	g := []string{
		"S.#.....",
		".##.###.",
		"....#...",
		".####.#.",
		"......#E",
	}
	Equal(t, MazeSteps(g), 15)
}

func TestNoRouteReturnsMinusOne(t *testing.T) {
	g := []string{
		"S#E",
		"##.",
		"...",
	}
	Equal(t, MazeSteps(g), -1)
	Equal(t, MazeSteps([]string{"S#", "#E"}), -1)
}

func TestMissingStartOrExitReturnsMinusOne(t *testing.T) {
	Equal(t, MazeSteps([]string{"...", "..E"}), -1)
	Equal(t, MazeSteps([]string{"S..", "..."}), -1)
	Equal(t, MazeSteps(nil), -1)
}

func TestALongSnakeIsHandled(t *testing.T) {
	// A serpentine corridor over 60 x 60 cells.
	const n = 60
	g := make([]string, n)
	for r := range g {
		row := []byte(strings.Repeat(".", n))
		if r%2 == 1 {
			row = []byte(strings.Repeat("#", n))
			if (r/2)%2 == 0 {
				row[n-1] = '.'
			} else {
				row[0] = '.'
			}
		}
		g[r] = string(row)
	}
	first := []byte(g[0])
	first[0] = 'S'
	g[0] = string(first)
	last := []byte(g[n-1])
	if ((n-1)/2)%2 == 0 {
		last[n-1] = 'E'
	} else {
		last[0] = 'E'
	}
	g[n-1] = string(last)
	True(t, MazeSteps(g) > 1000, "the snake is longer than 1000 steps, got %d", MazeSteps(g))
}
