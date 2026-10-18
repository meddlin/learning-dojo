#include <algorithm>
#include <iostream>
#include <utility>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

Matrix rotate_cw(const Matrix& m) {
    if (m.empty()) return {};
    std::size_t R = m.size(), C = m[0].size();
    Matrix out(C, std::vector<int>(R));
    for (std::size_t r = 0; r < R; ++r)
        for (std::size_t c = 0; c < C; ++c) out[c][R - 1 - r] = m[r][c];
    return out;
}

Matrix rotate_ccw(const Matrix& m) {
    if (m.empty()) return {};
    std::size_t R = m.size(), C = m[0].size();
    Matrix out(C, std::vector<int>(R));
    for (std::size_t r = 0; r < R; ++r)
        for (std::size_t c = 0; c < C; ++c) out[C - 1 - c][r] = m[r][c];
    return out;
}

Matrix rotate_180(const Matrix& m) {
    if (m.empty()) return {};
    std::size_t R = m.size(), C = m[0].size();
    Matrix out(R, std::vector<int>(C));
    for (std::size_t r = 0; r < R; ++r)
        for (std::size_t c = 0; c < C; ++c) out[R - 1 - r][C - 1 - c] = m[r][c];
    return out;
}

void rotate_in_place(Matrix& m) {
    std::size_t n = m.size();
    for (std::size_t r = 0; r < n; ++r)
        for (std::size_t c = r + 1; c < n; ++c) std::swap(m[r][c], m[c][r]);
    for (auto& row : m) std::reverse(row.begin(), row.end());
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
