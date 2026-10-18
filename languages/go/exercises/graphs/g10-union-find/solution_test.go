package main

import "testing"

func TestEveryoneStartsAlone(t *testing.T) {
	d := NewDSU(5)
	Equal(t, d.Components(), 5)
	for i := range 5 {
		Equal(t, d.Find(i), i)
		Equal(t, d.SizeOf(i), 1)
	}
}

func TestUniteMergesAndReports(t *testing.T) {
	d := NewDSU(6)
	True(t, d.Unite(0, 1))
	True(t, d.Unite(2, 3))
	False(t, d.Unite(1, 0))
	Equal(t, d.Components(), 4)
	Equal(t, d.Find(0), d.Find(1))
	Equal(t, d.Find(2), d.Find(3))
	True(t, d.Find(0) != d.Find(2))
}

func TestSizesFollowTheGroups(t *testing.T) {
	d := NewDSU(6)
	d.Unite(0, 1)
	d.Unite(1, 2)
	d.Unite(4, 5)
	Equal(t, d.SizeOf(0), 3)
	Equal(t, d.SizeOf(2), 3)
	Equal(t, d.SizeOf(4), 2)
	Equal(t, d.SizeOf(3), 1)
	d.Unite(2, 5)
	Equal(t, d.SizeOf(0), 5)
	Equal(t, d.SizeOf(4), 5)
}

func TestTransitiveMerging(t *testing.T) {
	d := NewDSU(8)
	d.Unite(0, 1)
	d.Unite(2, 3)
	d.Unite(1, 2)
	Equal(t, d.Find(0), d.Find(3))
	False(t, d.Unite(0, 3))
	Equal(t, d.Components(), 5)
}

func TestALongChainStaysFast(t *testing.T) {
	const n = 50000
	d := NewDSU(n)
	for i := 0; i+1 < n; i++ {
		True(t, d.Unite(i, i+1), "uniting %d and %d should merge two groups", i, i+1)
	}
	Equal(t, d.Components(), 1)
	Equal(t, d.SizeOf(0), n)
	root := d.Find(0)
	for i := range n {
		if d.Find(i) != root {
			t.Fatalf("element %d is not in the same group as 0", i)
		}
	}
}

func TestMSTOfASmallGraph(t *testing.T) {
	// Square 0-1-2-3 with a heavy diagonal.
	e := []WeightedEdge{{0, 1, 1}, {1, 2, 2}, {2, 3, 1}, {3, 0, 4}, {0, 2, 10}}
	Equal(t, MSTWeight(4, e), int64(4))
}

func TestMSTPicksCheapEdgesNotTheFirstOnes(t *testing.T) {
	e := []WeightedEdge{{0, 1, 100}, {1, 2, 100}, {0, 2, 1}, {2, 3, 1}, {1, 3, 1}}
	Equal(t, MSTWeight(4, e), int64(3))
}

func TestMSTOfADisconnectedGraphIsMinusOne(t *testing.T) {
	e := []WeightedEdge{{0, 1, 1}, {2, 3, 1}}
	Equal(t, MSTWeight(4, e), int64(-1))
}

func TestMSTTrivialSizes(t *testing.T) {
	Equal(t, MSTWeight(1, nil), int64(0))
	Equal(t, MSTWeight(2, []WeightedEdge{{0, 1, 7}}), int64(7))
	Equal(t, MSTWeight(2, nil), int64(-1))
}

func TestMSTHandlesLargeWeightsWithoutOverflow(t *testing.T) {
	const big = int64(3_000_000_000)
	e := []WeightedEdge{{0, 1, big}, {1, 2, big}, {0, 2, big}}
	Equal(t, MSTWeight(3, e), 2*big)
}
