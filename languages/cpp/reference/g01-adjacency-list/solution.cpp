#include <iostream>
#include <utility>
#include <vector>

using Graph = std::vector<std::vector<int>>;
using Edge = std::pair<int, int>;

Graph build_graph(int n, const std::vector<Edge>& edges, bool directed) {
    Graph g(n);
    for (const auto& [u, v] : edges) {
        g[u].push_back(v);
        if (!directed) g[v].push_back(u);
    }
    return g;
}

int out_degree(const Graph& g, int u) {
    return static_cast<int>(g[u].size());
}

std::vector<int> in_degrees(const Graph& g) {
    std::vector<int> in(g.size(), 0);
    for (const auto& neighbours : g) {
        for (int v : neighbours) ++in[v];
    }
    return in;
}

bool has_edge(const Graph& g, int u, int v) {
    for (int w : g[u]) {
        if (w == v) return true;
    }
    return false;
}

#ifndef DOJO_TEST
int main() {
    Graph g = build_graph(4, {{0, 1}, {0, 2}, {2, 3}}, false);
    for (std::size_t u = 0; u < g.size(); ++u) {
        std::cout << u << ":";
        for (int v : g[u]) std::cout << " " << v;
        std::cout << "\n";
    }
}
#endif
