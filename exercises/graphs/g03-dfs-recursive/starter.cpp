#include <iostream>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// Visit u and everything reachable from it that is not visited yet.
// Record each vertex in `order` as you first reach it (pre-order).
void dfs_visit(const Graph& g, int u, std::vector<bool>& visited, std::vector<int>& order) {
    // TODO
}

// Vertices in depth-first pre-order from `start`, trying neighbours in stored order.
std::vector<int> dfs_order(const Graph& g, int start) {
    return {};  // TODO
}

// True if `to` can be reached from `from` by following edges. A vertex reaches itself.
bool reachable(const Graph& g, int from, int to) {
    return false;  // TODO
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    for (int v : dfs_order(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
