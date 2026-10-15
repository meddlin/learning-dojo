#include <algorithm>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

// Minutes until every fresh orange (1) has rotted, 0 if there are none, -1 if impossible.
int minutes_to_rot(Matrix grid) {
    return -2;  // TODO
}

// For each cell, steps to the nearest 0 (4-directional moves).
Matrix distance_to_nearest_zero(const Matrix& mat) {
    return {};  // TODO
}

#ifndef DOJO_TEST
int main() {
    std::cout << minutes_to_rot({{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}) << "\n";
    Matrix d = distance_to_nearest_zero({{0, 0, 0}, {0, 1, 0}, {1, 1, 1}});
    for (auto& row : d) {
        for (int x : row) std::cout << x << " ";
        std::cout << "\n";
    }
}
#endif
