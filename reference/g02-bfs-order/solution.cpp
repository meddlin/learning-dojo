#include <iostream>
#include <queue>
#include <vector>

using Graph = std::vector<std::vector<int>>;

std::vector<int> bfs_order(const Graph& g, int start) {
    std::vector<bool> visited(g.size(), false);
    std::vector<int> order;
    std::queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : g[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    return order;
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
    for (int v : bfs_order(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
