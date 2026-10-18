#include "dojo.h"
#include "solution.cpp"

using V = std::vector<int>;

TEST(square_spiral) {
    CHECK_EQ(spiral_order({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}), (V{1, 2, 3, 6, 9, 8, 7, 4, 5}));
}

TEST(wide_rectangle) {
    CHECK_EQ(spiral_order({{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}}), (V{1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7}));
}

TEST(tall_rectangle) {
    CHECK_EQ(spiral_order({{1, 2}, {3, 4}, {5, 6}, {7, 8}}), (V{1, 2, 4, 6, 8, 7, 5, 3}));
}

TEST(single_row_is_not_walked_twice) {
    CHECK_EQ(spiral_order({{1, 2, 3, 4}}), (V{1, 2, 3, 4}));
}

TEST(single_column_is_not_walked_twice) {
    CHECK_EQ(spiral_order({{1}, {2}, {3}}), (V{1, 2, 3}));
}

TEST(single_cell_and_empty) {
    CHECK_EQ(spiral_order({{7}}), (V{7}));
    CHECK(spiral_order(Matrix{}).empty());
}

TEST(two_by_two_and_odd_middle) {
    CHECK_EQ(spiral_order({{1, 2}, {3, 4}}), (V{1, 2, 4, 3}));
    CHECK_EQ(spiral_order({{1, 2, 3}, {4, 5, 6}}), (V{1, 2, 3, 6, 5, 4}));
}

TEST(every_cell_exactly_once) {
    for (int rows = 1; rows <= 7; ++rows) {
        for (int cols = 1; cols <= 7; ++cols) {
            Matrix m(rows, V(cols));
            int v = 0;
            for (auto& row : m)
                for (int& x : row) x = v++;
            V out = spiral_order(m);
            INFO(std::to_string(rows) + " x " + std::to_string(cols));
            CHECK_EQ(out.size(), static_cast<std::size_t>(rows * cols));
            std::sort(out.begin(), out.end());
            V all(rows * cols);
            std::iota(all.begin(), all.end(), 0);
            CHECK_EQ(out, all);
        }
    }
}

TEST(spiral_matrix_small) {
    CHECK_EQ(spiral_matrix(1), (Matrix{{1}}));
    CHECK_EQ(spiral_matrix(2), (Matrix{{1, 2}, {4, 3}}));
    CHECK_EQ(spiral_matrix(3), (Matrix{{1, 2, 3}, {8, 9, 4}, {7, 6, 5}}));
}

TEST(spiral_matrix_four) {
    CHECK_EQ(spiral_matrix(4), (Matrix{{1, 2, 3, 4}, {12, 13, 14, 5}, {11, 16, 15, 6}, {10, 9, 8, 7}}));
}

TEST(spiral_matrix_zero) {
    CHECK(spiral_matrix(0).empty());
}

TEST(reading_a_spiral_matrix_in_spiral_order_counts_up) {
    for (int n : {1, 2, 5, 6, 9}) {
        V want(n * n);
        std::iota(want.begin(), want.end(), 1);
        INFO("n = " + std::to_string(n));
        CHECK_EQ(spiral_order(spiral_matrix(n)), want);
    }
}

int main() { return dojo::run_all(); }
