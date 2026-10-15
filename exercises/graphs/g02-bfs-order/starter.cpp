#include <iostream>
#include <queue>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// Vertices in the order breadth-first search reaches them from `start`.
// Try each vertex's neighbours in the order they are stored in g[u].
// Only vertices reachable from `start` appear, each exactly once.
std::vector<int> bfs_order(const Graph& g, int start) {
    return {};  // TODO
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
    for (int v : bfs_order(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
