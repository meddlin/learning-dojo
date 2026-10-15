#include "dojo.h"
#include "solution.cpp"

TEST(make_matrix_has_the_right_shape_and_fill) {
    Matrix m = make_matrix(2, 3, 7);
    CHECK_EQ(m, (Matrix{{7, 7, 7}, {7, 7, 7}}));
}

TEST(make_matrix_rows_are_independent) {
    Matrix m = make_matrix(2, 2, 0);
    m[0][0] = 5;
    CHECK_EQ(m[1][0], 0);
}

TEST(make_matrix_zero_sized) {
    CHECK(make_matrix(0, 5, 1).empty());
}

TEST(transpose_rectangular) {
    Matrix m = {{1, 2, 3}, {4, 5, 6}};
    CHECK_EQ(transpose(m), (Matrix{{1, 4}, {2, 5}, {3, 6}}));
}

TEST(transpose_square_and_single_row_and_column) {
    CHECK_EQ(transpose({{1, 2}, {3, 4}}), (Matrix{{1, 3}, {2, 4}}));
    CHECK_EQ(transpose({{1, 2, 3}}), (Matrix{{1}, {2}, {3}}));
    CHECK_EQ(transpose({{1}, {2}, {3}}), (Matrix{{1, 2, 3}}));
}

TEST(transpose_twice_is_the_identity) {
    Matrix m = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}};
    CHECK_EQ(transpose(transpose(m)), m);
}

TEST(transpose_empty) {
    CHECK(transpose(Matrix{}).empty());
}

TEST(sums) {
    Matrix m = {{1, 2, 3}, {4, 5, 6}};
    CHECK_EQ(row_sums(m), (std::vector<int>{6, 15}));
    CHECK_EQ(col_sums(m), (std::vector<int>{5, 7, 9}));
}

TEST(sums_of_negative_and_single_cells) {
    CHECK_EQ(row_sums({{-1, 1}, {-5, -5}}), (std::vector<int>{0, -10}));
    CHECK_EQ(col_sums({{-1, 1}, {-5, -5}}), (std::vector<int>{-6, -4}));
    CHECK_EQ(row_sums({{42}}), std::vector<int>{42});
    CHECK_EQ(col_sums({{42}}), std::vector<int>{42});
}

TEST(sums_of_the_empty_matrix) {
    CHECK(row_sums(Matrix{}).empty());
    CHECK(col_sums(Matrix{}).empty());
}

TEST(symmetric_matrices) {
    CHECK(is_symmetric({{1, 2, 3}, {2, 4, 5}, {3, 5, 6}}));
    CHECK(is_symmetric({{9}}));
    CHECK(is_symmetric(Matrix{}));
}

TEST(non_symmetric_matrices) {
    CHECK_FALSE(is_symmetric({{1, 2}, {3, 4}}));
    CHECK_FALSE(is_symmetric({{1, 2, 3}, {2, 4, 5}, {3, 9, 6}}));
}

TEST(non_square_is_never_symmetric) {
    CHECK_FALSE(is_symmetric({{1, 2, 3}, {4, 5, 6}}));
    CHECK_FALSE(is_symmetric({{1}, {1}}));
}

int main() { return dojo::run_all(); }
