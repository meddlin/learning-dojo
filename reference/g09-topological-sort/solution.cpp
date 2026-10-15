#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Graph = std::vector<std::vector<int>>;

std::vector<int> topo_order(const Graph& g) {
    int n = static_cast<int>(g.size());
    std::vector<int> indeg(n, 0);
    for (int u = 0; u < n; ++u)
        for (int v : g[u]) ++indeg[v];
    std::queue<int> q;
    for (int v = 0; v < n; ++v)
        if (indeg[v] == 0) q.push(v);
    std::vector<int> order;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        order.push_back(u);
        for (int v : g[u])
            if (--indeg[v] == 0) q.push(v);
    }
    if (static_cast<int>(order.size()) != n) return {};
    return order;
}

bool can_finish(int num_courses, const std::vector<std::pair<int, int>>& prereqs) {
    Graph g(num_courses);
    for (auto [a, b] : prereqs) g[b].push_back(a);
    return static_cast<int>(topo_order(g).size()) == num_courses;
}

#ifndef DOJO_TEST
int main() {
    // 0 -> 1 -> 3, 0 -> 2 -> 3
    Graph g = {{1, 2}, {3}, {3}, {}};
    for (int v : topo_order(g)) std::cout << v << " ";
    std::cout << "\n";
    std::cout << std::boolalpha << can_finish(2, {{1, 0}}) << " " << can_finish(2, {{1, 0}, {0, 1}}) << "\n";
}
#endif
