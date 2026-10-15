#include <iostream>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

// rows x cols matrix, every cell == fill.
Matrix make_matrix(int rows, int cols, int fill) {
    return {};  // TODO
}

// Swap rows and columns.
Matrix transpose(const Matrix& m) {
    return {};  // TODO
}

// Sum of each row / of each column.
std::vector<int> row_sums(const Matrix& m) {
    return {};  // TODO
}
std::vector<int> col_sums(const Matrix& m) {
    return {};  // TODO
}

// Square and equal to its own transpose?
bool is_symmetric(const Matrix& m) {
    return false;  // TODO
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
