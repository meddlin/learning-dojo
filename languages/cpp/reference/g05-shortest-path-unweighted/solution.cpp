#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>

using Graph = std::vector<std::vector<int>>;

std::vector<int> bfs_dist(const Graph& g, int start) {
    std::vector<int> dist(g.size(), -1);
    std::queue<int> q;
    dist[start] = 0;
    q.push(start);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    return dist;
}

std::vector<int> shortest_path(const Graph& g, int start, int target) {
    std::vector<int> parent(g.size(), -1);
    std::vector<bool> seen(g.size(), false);
    std::queue<int> q;
    seen[start] = true;
    q.push(start);
    while (!q.empty() && !seen[target]) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (!seen[v]) {
                seen[v] = true;
                parent[v] = u;
                q.push(v);
            }
        }
    }
    if (!seen[target]) return {};
    std::vector<int> path;
    for (int v = target; v != -1; v = parent[v]) path.push_back(v);
    std::reverse(path.begin(), path.end());
    return path;
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2, 4}, {3}};
    for (int d : bfs_dist(g, 0)) std::cout << d << " ";
    std::cout << "\n";
    for (int v : shortest_path(g, 0, 4)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
