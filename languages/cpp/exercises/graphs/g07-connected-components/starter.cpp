#include <iostream>
#include <queue>
#include <string>
#include <vector>

using Graph = std::vector<std::vector<int>>;

// Number of connected components in an undirected graph.
int count_components(const Graph& g) {
    return -1;  // TODO
}

// Number of islands of '1' cells; neighbours are up/down/left/right only.
int num_islands(const std::vector<std::string>& grid) {
    return -1;  // TODO
}

// Size (in cells) of the biggest island; 0 if the grid has no land.
int largest_island(const std::vector<std::string>& grid) {
    return -1;  // TODO
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1}, {0}, {3}, {2}, {}};
    std::cout << "components: " << count_components(g) << "\n";
    std::vector<std::string> map = {"11000", "11000", "00100", "00011"};
    std::cout << "islands: " << num_islands(map) << ", largest: " << largest_island(map) << "\n";
}
#endif
