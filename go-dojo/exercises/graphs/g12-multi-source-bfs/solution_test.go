package main

import "testing"

func chkCopyGrid(g [][]int) [][]int {
	out := make([][]int, len(g))
	for i := range g {
		out[i] = append([]int(nil), g[i]...)
	}
	return out
}

func TestOrangesClassicExample(t *testing.T) {
	Equal(t, MinutesToRot([][]int{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}), 4)
}

func TestOrangesCutOffByAnEmptyCell(t *testing.T) {
	Equal(t, MinutesToRot([][]int{{2, 1, 1}, {0, 1, 1}, {1, 0, 1}}), -1)
}

func TestOrangesNothingToDo(t *testing.T) {
	Equal(t, MinutesToRot([][]int{{0, 2}}), 0)
	Equal(t, MinutesToRot([][]int{{0}}), 0)
	Equal(t, MinutesToRot([][]int{{2, 2}, {2, 2}}), 0)
}

func TestOrangesWithNoRottenSource(t *testing.T) {
	Equal(t, MinutesToRot([][]int{{1}}), -1)
	Equal(t, MinutesToRot([][]int{{1, 1}, {0, 1}}), -1)
}

func TestOrangesTwoSourcesRotFasterThanOne(t *testing.T) {
	Equal(t, MinutesToRot([][]int{{2, 1, 1, 1, 2}}), 2)
	Equal(t, MinutesToRot([][]int{{2, 1, 1, 1, 1}}), 4)
}

func TestOrangesALongRow(t *testing.T) {
	row := make([]int, 500)
	for i := range row {
		row[i] = 1
	}
	row[0] = 2
	Equal(t, MinutesToRot([][]int{row}), 499)
}

func TestOrangesDoesNotModifyTheCallersGrid(t *testing.T) {
	g := [][]int{{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}
	before := chkCopyGrid(g)
	MinutesToRot(g)
	Equal(t, g, before)
}

func TestZeroDistanceExample(t *testing.T) {
	m := [][]int{{0, 0, 0}, {0, 1, 0}, {1, 1, 1}}
	want := [][]int{{0, 0, 0}, {0, 1, 0}, {1, 2, 1}}
	Equal(t, DistanceToNearestZero(m), want)
}

func TestZeroDistanceInARow(t *testing.T) {
	Equal(t, DistanceToNearestZero([][]int{{0, 1, 1, 1, 1}}), [][]int{{0, 1, 2, 3, 4}})
	Equal(t, DistanceToNearestZero([][]int{{1, 1, 0, 1, 1}}), [][]int{{2, 1, 0, 1, 2}})
}

func TestZeroDistanceAllZeros(t *testing.T) {
	m := [][]int{{0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}}
	Equal(t, DistanceToNearestZero(m), m)
}

func TestZeroDistanceToTheNearestOfTwo(t *testing.T) {
	m := [][]int{{0, 1, 1, 1, 0}}
	Equal(t, DistanceToNearestZero(m), [][]int{{0, 1, 2, 1, 0}})
}

func TestZeroDistanceDoesNotModifyTheInput(t *testing.T) {
	m := [][]int{{0, 1}, {1, 1}}
	before := chkCopyGrid(m)
	DistanceToNearestZero(m)
	Equal(t, m, before)
}

func TestZeroDistanceOnABigGrid(t *testing.T) {
	const n = 120
	m := make([][]int, n)
	for r := range m {
		m[r] = make([]int, n)
		for c := range m[r] {
			m[r][c] = 1
		}
	}
	m[0][0] = 0
	d := DistanceToNearestZero(m)
	Equal(t, d[n-1][n-1], 2*(n-1))
	Equal(t, d[5][7], 12)
}
