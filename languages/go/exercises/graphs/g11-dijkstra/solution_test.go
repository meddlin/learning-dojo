package main

import "testing"

// chkSlowDijkstra is O(V^2) Dijkstra with no heap: slow but obviously correct.
func chkSlowDijkstra(g WGraph, start int) []int64 {
	n := len(g)
	dist := make([]int64, n)
	for i := range dist {
		dist[i] = INF
	}
	done := make([]bool, n)
	dist[start] = 0
	for range n {
		u := -1
		for v := range n {
			if !done[v] && dist[v] < INF && (u == -1 || dist[v] < dist[u]) {
				u = v
			}
		}
		if u == -1 {
			break
		}
		done[u] = true
		for _, a := range g[u] {
			dist[a.To] = min(dist[a.To], dist[u]+a.W)
		}
	}
	return dist
}

func chkCheapestEdge(g WGraph, u, v int) int64 {
	best := int64(-1)
	for _, a := range g[u] {
		if a.To == v && (best == -1 || a.W < best) {
			best = a.W
		}
	}
	return best
}

// chkPathCost is the cost of walking p along real edges, or -1 if some step is not an edge.
func chkPathCost(g WGraph, p []int) int64 {
	var total int64
	for i := 0; i+1 < len(p); i++ {
		w := chkCheapestEdge(g, p[i], p[i+1])
		if w < 0 {
			return -1
		}
		total += w
	}
	return total
}

func chkRandomGraph(n, m int, seed uint64, maxW int) WGraph {
	g := make(WGraph, n)
	s := seed
	next := func() int {
		s = s*6364136223846793005 + 1442695040888963407
		return int(uint32(s >> 33))
	}
	for range m {
		u, v := next()%n, next()%n
		w := int64(next() % maxW)
		g[u] = append(g[u], Arc{v, w})
	}
	return g
}

func TestSmallExampleWithADetour(t *testing.T) {
	g := make(WGraph, 4)
	g[0] = []Arc{{1, 4}, {2, 1}}
	g[2] = []Arc{{1, 2}, {3, 7}}
	g[1] = []Arc{{3, 1}}
	Equal(t, Dijkstra(g, 0), []int64{0, 3, 1, 4})
}

func TestFewestEdgesIsNotCheapest(t *testing.T) {
	// Direct edge costs 100; the 3-hop route costs 3.
	g := make(WGraph, 4)
	g[0] = []Arc{{3, 100}, {1, 1}}
	g[1] = []Arc{{2, 1}}
	g[2] = []Arc{{3, 1}}
	Equal(t, Dijkstra(g, 0)[3], int64(3))
}

func TestUnreachableIsINF(t *testing.T) {
	g := make(WGraph, 3)
	g[0] = []Arc{{1, 5}}
	d := Dijkstra(g, 0)
	Equal(t, d[1], int64(5))
	Equal(t, d[2], INF)
}

func TestEdgesAreDirected(t *testing.T) {
	g := make(WGraph, 2)
	g[0] = []Arc{{1, 3}}
	Equal(t, Dijkstra(g, 1)[0], INF)
}

func TestZeroWeightEdgesAndParallelEdges(t *testing.T) {
	g := make(WGraph, 3)
	g[0] = []Arc{{1, 0}, {1, 9}, {2, 5}}
	g[1] = []Arc{{2, 0}}
	Equal(t, Dijkstra(g, 0), []int64{0, 0, 0})
}

func TestLargeWeightsAddUpCorrectly(t *testing.T) {
	g := make(WGraph, 4)
	const big = int64(400_000_000_000_000_000) // 4e17
	g[0] = []Arc{{1, big}}
	g[1] = []Arc{{2, big}}
	d := Dijkstra(g, 0)
	Equal(t, d[1], big)
	Equal(t, d[2], 2*big)
	Equal(t, d[3], INF)
}

func TestMatchesTheSlowVersionOnRandomGraphs(t *testing.T) {
	for seed := uint64(1); seed <= 12; seed++ {
		n := 5 + int(seed)*7
		g := chkRandomGraph(n, n*3, seed, 50)
		Equal(t, Dijkstra(g, 0), chkSlowDijkstra(g, 0), "seed %d", seed)
	}
}

func TestABigGraphFinishesQuickly(t *testing.T) {
	g := chkRandomGraph(20000, 100000, 99, 1000)
	d := Dijkstra(g, 0)
	Equal(t, d[0], int64(0))
	Equal(t, len(d), 20000)
}

func TestPathToSelf(t *testing.T) {
	g := make(WGraph, 2)
	g[0] = []Arc{{1, 1}}
	Equal(t, DijkstraPath(g, 0, 0), []int{0})
}

func TestPathIsEmptyWhenUnreachable(t *testing.T) {
	g := make(WGraph, 3)
	g[0] = []Arc{{1, 1}}
	Equal(t, len(DijkstraPath(g, 0, 2)), 0)
}

func TestPathFollowsTheCheapRoute(t *testing.T) {
	g := make(WGraph, 4)
	g[0] = []Arc{{1, 4}, {2, 1}}
	g[2] = []Arc{{1, 2}, {3, 7}}
	g[1] = []Arc{{3, 1}}
	Equal(t, DijkstraPath(g, 0, 3), []int{0, 2, 1, 3})
}

func TestPathsAreRealAndCostExactlyTheDistance(t *testing.T) {
	for seed := uint64(20); seed < 28; seed++ {
		g := chkRandomGraph(60, 200, seed, 30)
		d := chkSlowDijkstra(g, 0)
		for target := range 60 {
			p := DijkstraPath(g, 0, target)
			if d[target] >= INF {
				Equal(t, len(p), 0, "seed %d, target %d is unreachable, so expect no path", seed, target)
				continue
			}
			True(t, len(p) > 0, "seed %d, target %d: expected a path", seed, target)
			Equal(t, p[0], 0, "seed %d, target %d", seed, target)
			Equal(t, p[len(p)-1], target, "seed %d, target %d", seed, target)
			Equal(t, chkPathCost(g, p), d[target], "seed %d, target %d: path %v", seed, target, p)
		}
	}
}
