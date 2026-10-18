#include <iostream>
#include <stack>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// Depth-first pre-order from `start` using an explicit std::stack (no recursion).
// The order must match the recursive version exactly: g[u]'s neighbours are tried in stored order.
std::vector<int> dfs_order_iterative(const Graph& g, int start) {
    return {};  // TODO
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    for (int v : dfs_order_iterative(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
