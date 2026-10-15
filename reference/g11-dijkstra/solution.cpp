#include <algorithm>
#include <functional>
#include <iostream>
#include <limits>
#include <queue>
#include <utility>
#include <vector>

using WGraph = std::vector<std::vector<std::pair<int, long long>>>;
const long long INF = std::numeric_limits<long long>::max() / 4;

static void run(const WGraph& g, int start, std::vector<long long>& dist, std::vector<int>& parent) {
    using P = std::pair<long long, int>;
    dist.assign(g.size(), INF);
    parent.assign(g.size(), -1);
    std::priority_queue<P, std::vector<P>, std::greater<P>> pq;
    dist[start] = 0;
    pq.push({0, start});
    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;
        for (auto [v, w] : g[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }
}

std::vector<long long> dijkstra(const WGraph& g, int start) {
    std::vector<long long> dist;
    std::vector<int> parent;
    run(g, start, dist, parent);
    return dist;
}

std::vector<int> dijkstra_path(const WGraph& g, int start, int target) {
    std::vector<long long> dist;
    std::vector<int> parent;
    run(g, start, dist, parent);
    if (dist[target] >= INF) return {};
    std::vector<int> path;
    for (int v = target; v != -1; v = parent[v]) path.push_back(v);
    std::reverse(path.begin(), path.end());
    return path;
}

#ifndef DOJO_TEST
int main() {
    WGraph g(4);
    g[0] = {{1, 4}, {2, 1}};
    g[2] = {{1, 2}, {3, 7}};
    g[1] = {{3, 1}};
    for (long long d : dijkstra(g, 0)) std::cout << d << " ";
    std::cout << "\n";
    for (int v : dijkstra_path(g, 0, 3)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
