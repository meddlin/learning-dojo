#include <iostream>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

// All cells in clockwise spiral order, starting at the top-left.
std::vector<int> spiral_order(const Matrix& m) {
    return {};  // TODO
}

// n x n matrix filled with 1..n*n along a clockwise spiral.
Matrix spiral_matrix(int n) {
    return {};  // TODO
}

#ifndef DOJO_TEST
int main() {
    Matrix m = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
    for (int x : spiral_order(m)) std::cout << x << " ";
    std::cout << "\n";
    for (const auto& row : spiral_matrix(4)) {
        for (int x : row) std::cout << x << "\t";
        std::cout << "\n";
    }
}
#endif
