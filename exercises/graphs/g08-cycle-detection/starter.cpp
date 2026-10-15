#include <iostream>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// True if the simple undirected graph contains a cycle.
bool has_cycle_undirected(const Graph& g) {
    return false;  // TODO
}

// True if the directed graph contains a cycle (self-loops count).
bool has_cycle_directed(const Graph& g) {
    return false;  // TODO
}

#ifndef DOJO_TEST
int main() {
    Graph triangle = {{1, 2}, {0, 2}, {0, 1}};
    Graph tree = {{1, 2}, {0}, {0}};
    std::cout << std::boolalpha;
    std::cout << has_cycle_undirected(triangle) << " " << has_cycle_undirected(tree) << "\n";
    Graph loop = {{1}, {2}, {0}};
    Graph dag = {{1, 2}, {2}, {}};
    std::cout << has_cycle_directed(loop) << " " << has_cycle_directed(dag) << "\n";
}
#endif
