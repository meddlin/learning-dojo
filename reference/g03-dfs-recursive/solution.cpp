#include <iostream>
#include <vector>

using Graph = std::vector<std::vector<int>>;

void dfs_visit(const Graph& g, int u, std::vector<bool>& visited, std::vector<int>& order) {
    visited[u] = true;
    order.push_back(u);
    for (int v : g[u]) {
        if (!visited[v]) dfs_visit(g, v, visited, order);
    }
}

std::vector<int> dfs_order(const Graph& g, int start) {
    std::vector<bool> visited(g.size(), false);
    std::vector<int> order;
    dfs_visit(g, start, visited, order);
    return order;
}

bool reachable(const Graph& g, int from, int to) {
    std::vector<bool> visited(g.size(), false);
    std::vector<int> order;
    dfs_visit(g, from, visited, order);
    return visited[to];
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    for (int v : dfs_order(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
