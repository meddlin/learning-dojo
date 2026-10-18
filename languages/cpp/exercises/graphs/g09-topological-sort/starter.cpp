#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// A topological order of g, or an empty vector if g has a cycle.
std::vector<int> topo_order(const Graph& g) {
    return {};  // TODO
}

// prereqs {a, b}: course b must be taken before course a.
bool can_finish(int num_courses, const std::vector<std::pair<int, int>>& prereqs) {
    return false;  // TODO
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
