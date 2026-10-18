#include <iostream>
#include <utility>
#include <vector>

// g[u] lists the neighbours of vertex u. Vertices are 0..n-1.
using Graph = std::vector<std::vector<int>>;
using Edge = std::pair<int, int>;

// n vertices. For each edge (u, v): add v to g[u]; if the graph is not directed, also add u to g[v].
// Keep neighbours in the order the edges were given. Inputs contain no self-loops.
Graph build_graph(int n, const std::vector<Edge>& edges, bool directed) {
    return {};  // TODO
}

// How many edges leave u.
int out_degree(const Graph& g, int u) {
    return -1;  // TODO
}

// For every vertex, how many edges enter it.
std::vector<int> in_degrees(const Graph& g) {
    return {};  // TODO
}

// True if there is an edge u -> v.
bool has_edge(const Graph& g, int u, int v) {
    return false;  // TODO
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
