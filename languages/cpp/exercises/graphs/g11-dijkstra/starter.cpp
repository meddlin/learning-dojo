#include <algorithm>
#include <functional>
#include <iostream>
#include <limits>
#include <queue>
#include <utility>
#include <vector>

using WGraph = std::vector<std::vector<std::pair<int, long long>>>;  // g[u] = {(v, weight), ...}
const long long INF = std::numeric_limits<long long>::max() / 4;

// Shortest distance from `start` to every vertex (INF if unreachable).
std::vector<long long> dijkstra(const WGraph& g, int start) {
    return {};  // TODO
}

// A cheapest path start..target inclusive; empty if unreachable.
std::vector<int> dijkstra_path(const WGraph& g, int start, int target) {
    return {};  // TODO
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
