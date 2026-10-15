#include <algorithm>
#include <iostream>
#include <queue>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// dist[v] = fewest edges from `start` to v, or -1 if v is unreachable.
std::vector<int> bfs_dist(const Graph& g, int start) {
    return {};  // TODO
}

// One shortest path from `start` to `target`, both included.
// Empty if unreachable; {start} if start == target.
std::vector<int> shortest_path(const Graph& g, int start, int target) {
    return {};  // TODO
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
