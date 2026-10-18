#include <iostream>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

std::vector<int> spiral_order(const Matrix& m) {
    std::vector<int> out;
    if (m.empty()) return out;
    int top = 0, bottom = static_cast<int>(m.size()) - 1;
    int left = 0, right = static_cast<int>(m[0].size()) - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; ++c) out.push_back(m[top][c]);
        ++top;
        for (int r = top; r <= bottom; ++r) out.push_back(m[r][right]);
        --right;
        if (top <= bottom) {
            for (int c = right; c >= left; --c) out.push_back(m[bottom][c]);
            --bottom;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; --r) out.push_back(m[r][left]);
            ++left;
        }
    }
    return out;
}

Matrix spiral_matrix(int n) {
    Matrix m(n, std::vector<int>(n, 0));
    int top = 0, bottom = n - 1, left = 0, right = n - 1;
    int next = 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; ++c) m[top][c] = next++;
        ++top;
        for (int r = top; r <= bottom; ++r) m[r][right] = next++;
        --right;
        if (top <= bottom) {
            for (int c = right; c >= left; --c) m[bottom][c] = next++;
            --bottom;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; --r) m[r][left] = next++;
            ++left;
        }
    }
    return m;
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
