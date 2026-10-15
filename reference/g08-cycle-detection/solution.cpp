#include <iostream>
#include <vector>

using Graph = std::vector<std::vector<int>>;

static bool undirected_dfs(const Graph& g, int u, int parent, std::vector<bool>& visited) {
    visited[u] = true;
    for (int v : g[u]) {
        if (v == parent) continue;
        if (visited[v]) return true;
        if (undirected_dfs(g, v, u, visited)) return true;
    }
    return false;
}

bool has_cycle_undirected(const Graph& g) {
    std::vector<bool> visited(g.size(), false);
    for (int s = 0; s < static_cast<int>(g.size()); ++s) {
        if (!visited[s] && undirected_dfs(g, s, -1, visited)) return true;
    }
    return false;
}

static bool directed_dfs(const Graph& g, int u, std::vector<int>& state) {
    state[u] = 1;
    for (int v : g[u]) {
        if (state[v] == 1) return true;
        if (state[v] == 0 && directed_dfs(g, v, state)) return true;
    }
    state[u] = 2;
    return false;
}

bool has_cycle_directed(const Graph& g) {
    std::vector<int> state(g.size(), 0);
    for (int s = 0; s < static_cast<int>(g.size()); ++s) {
        if (state[s] == 0 && directed_dfs(g, s, state)) return true;
    }
    return false;
}

#ifndef DOJO_TEST
int main() {
    Graph triangle = {{1, 2}, {0, 2}, {0, 1}};
    Graph tree = {{1, 2}, {0}, {0}};
    std::cout << std::boolalpha;
    std::cout << has_cycle_undirected(triangle) << " " << has_cycle_undirected(tree) << "\n";
    Graph loop = {{1}, {2}, {0}};
    Graph dag = {{1, 2}, {2}, {}};
    std::cout << has_cycle_directed(loop) << " " << has_cycle_directed(dag) << "\n";
}
#endif
