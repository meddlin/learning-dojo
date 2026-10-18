package main

import "fmt"

type Graph [][]int

func HasCycleUndirected(g Graph) bool {
	visited := make([]bool, len(g))
	var dfs func(u, parent int) bool
	dfs = func(u, parent int) bool {
		visited[u] = true
		for _, v := range g[u] {
			if !visited[v] {
				if dfs(v, u) {
					return true
				}
			} else if v != parent {
				return true
			}
		}
		return false
	}
	for s := range g {
		if !visited[s] && dfs(s, -1) {
			return true
		}
	}
	return false
}

func HasCycleDirected(g Graph) bool {
	const (
		unseen = iota
		onPath
		done
	)
	state := make([]int, len(g))
	var dfs func(u int) bool
	dfs = func(u int) bool {
		state[u] = onPath
		for _, v := range g[u] {
			if state[v] == onPath {
				return true
			}
			if state[v] == unseen && dfs(v) {
				return true
			}
		}
		state[u] = done
		return false
	}
	for s := range g {
		if state[s] == unseen && dfs(s) {
			return true
		}
	}
	return false
}

func main() {
	triangle := Graph{{1, 2}, {0, 2}, {0, 1}}
	fmt.Println(HasCycleUndirected(triangle))
	fmt.Println(HasCycleDirected(Graph{{1}, {2}, {}}))
}
