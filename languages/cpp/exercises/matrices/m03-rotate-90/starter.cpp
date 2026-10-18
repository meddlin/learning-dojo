#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

// New matrix, rotated 90 degrees clockwise (any rectangle).
Matrix rotate_cw(const Matrix& m) {
    return {};  // TODO
}

// New matrix, rotated 90 degrees counter-clockwise.
Matrix rotate_ccw(const Matrix& m) {
    return {};  // TODO
}

// New matrix, rotated 180 degrees.
Matrix rotate_180(const Matrix& m) {
    return {};  // TODO
}

// Rotate a square matrix clockwise in place (no second matrix).
void rotate_in_place(Matrix& m) {
    // TODO
}

#ifndef DOJO_TEST
void print(const Matrix& m) {
    for (const auto& row : m) {
        for (int x : row) std::cout << x << "\t";
        std::cout << "\n";
    }
}

int main() {
    Matrix m = {{1, 2, 3}, {4, 5, 6}};
    print(rotate_cw(m));
}
#endif
