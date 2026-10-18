#include <iostream>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

Matrix make_matrix(int rows, int cols, int fill) {
    return Matrix(rows, std::vector<int>(cols, fill));
}

Matrix transpose(const Matrix& m) {
    if (m.empty()) return {};
    std::size_t rows = m.size(), cols = m[0].size();
    Matrix t(cols, std::vector<int>(rows));
    for (std::size_t r = 0; r < rows; ++r)
        for (std::size_t c = 0; c < cols; ++c) t[c][r] = m[r][c];
    return t;
}

std::vector<int> row_sums(const Matrix& m) {
    std::vector<int> sums;
    for (const auto& row : m) {
        int s = 0;
        for (int x : row) s += x;
        sums.push_back(s);
    }
    return sums;
}

std::vector<int> col_sums(const Matrix& m) {
    if (m.empty()) return {};
    std::vector<int> sums(m[0].size(), 0);
    for (const auto& row : m)
        for (std::size_t c = 0; c < row.size(); ++c) sums[c] += row[c];
    return sums;
}

bool is_symmetric(const Matrix& m) {
    for (const auto& row : m)
        if (row.size() != m.size()) return false;
    for (std::size_t r = 0; r < m.size(); ++r)
        for (std::size_t c = r + 1; c < m.size(); ++c)
            if (m[r][c] != m[c][r]) return false;
    return true;
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
    print(m);
    std::cout << "--\n";
    print(transpose(m));
}
#endif
