#include "dojo.h"
#include "solution.cpp"

static Matrix counting(int rows, int cols) {
    Matrix m(rows, std::vector<int>(cols));
    int v = 1;
    for (auto& row : m)
        for (int& x : row) x = v++;
    return m;
}

TEST(clockwise_rectangle) {
    CHECK_EQ(rotate_cw({{1, 2, 3}, {4, 5, 6}}), (Matrix{{4, 1}, {5, 2}, {6, 3}}));
}

TEST(clockwise_square) {
    CHECK_EQ(rotate_cw({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}), (Matrix{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}));
}

TEST(clockwise_row_and_column_and_single) {
    CHECK_EQ(rotate_cw({{1, 2, 3}}), (Matrix{{1}, {2}, {3}}));
    CHECK_EQ(rotate_cw({{1}, {2}, {3}}), (Matrix{{3, 2, 1}}));
    CHECK_EQ(rotate_cw({{5}}), (Matrix{{5}}));
}

TEST(counter_clockwise_rectangle) {
    CHECK_EQ(rotate_ccw({{1, 2, 3}, {4, 5, 6}}), (Matrix{{3, 6}, {2, 5}, {1, 4}}));
}

TEST(counter_clockwise_square) {
    CHECK_EQ(rotate_ccw({{1, 2}, {3, 4}}), (Matrix{{2, 4}, {1, 3}}));
}

TEST(rotate_180_rectangle) {
    CHECK_EQ(rotate_180({{1, 2, 3}, {4, 5, 6}}), (Matrix{{6, 5, 4}, {3, 2, 1}}));
}

TEST(four_clockwise_turns_come_back) {
    Matrix m = counting(3, 5);
    Matrix r = m;
    for (int i = 0; i < 4; ++i) r = rotate_cw(r);
    CHECK_EQ(r, m);
}

TEST(cw_and_ccw_cancel) {
    Matrix m = counting(4, 2);
    CHECK_EQ(rotate_ccw(rotate_cw(m)), m);
    CHECK_EQ(rotate_cw(rotate_ccw(m)), m);
}

TEST(180_equals_two_clockwise_turns) {
    Matrix m = counting(3, 4);
    CHECK_EQ(rotate_180(m), rotate_cw(rotate_cw(m)));
}

TEST(empty_matrix_stays_empty) {
    CHECK(rotate_cw(Matrix{}).empty());
    CHECK(rotate_ccw(Matrix{}).empty());
    CHECK(rotate_180(Matrix{}).empty());
}

TEST(in_place_2x2_and_3x3) {
    Matrix a = {{1, 2}, {3, 4}};
    rotate_in_place(a);
    CHECK_EQ(a, (Matrix{{3, 1}, {4, 2}}));
    Matrix b = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    rotate_in_place(b);
    CHECK_EQ(b, (Matrix{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}));
}

TEST(in_place_matches_the_copying_version) {
    for (int n : {1, 2, 3, 4, 5, 8, 17}) {
        Matrix m = counting(n, n);
        Matrix want = rotate_cw(m);
        rotate_in_place(m);
        INFO("n = " + std::to_string(n));
        CHECK_EQ(m, want);
    }
}

TEST(in_place_on_empty_does_not_crash) {
    Matrix m;
    rotate_in_place(m);
    CHECK(m.empty());
}

int main() { return dojo::run_all(); }
