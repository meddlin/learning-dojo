#include "dojo.h"
#include "solution.cpp"

TEST(oranges_classic_example) {
    CHECK_EQ(minutes_to_rot({{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}), 4);
}

TEST(oranges_cut_off_by_an_empty_cell) {
    CHECK_EQ(minutes_to_rot({{2, 1, 1}, {0, 1, 1}, {1, 0, 1}}), -1);
}

TEST(oranges_nothing_to_do) {
    CHECK_EQ(minutes_to_rot({{0, 2}}), 0);
    CHECK_EQ(minutes_to_rot({{0}}), 0);
    CHECK_EQ(minutes_to_rot({{2, 2}, {2, 2}}), 0);
}

TEST(oranges_with_no_rotten_source) {
    CHECK_EQ(minutes_to_rot({{1}}), -1);
    CHECK_EQ(minutes_to_rot({{1, 1}, {0, 1}}), -1);
}

TEST(oranges_two_sources_rot_faster_than_one) {
    CHECK_EQ(minutes_to_rot({{2, 1, 1, 1, 2}}), 2);
    CHECK_EQ(minutes_to_rot({{2, 1, 1, 1, 1}}), 4);
}

TEST(oranges_a_long_row) {
    Matrix g(1, std::vector<int>(500, 1));
    g[0][0] = 2;
    CHECK_EQ(minutes_to_rot(g), 499);
}

TEST(zero_distance_example) {
    Matrix m = {{0, 0, 0}, {0, 1, 0}, {1, 1, 1}};
    Matrix want = {{0, 0, 0}, {0, 1, 0}, {1, 2, 1}};
    CHECK_EQ(distance_to_nearest_zero(m), want);
}

TEST(zero_distance_in_a_row) {
    CHECK_EQ(distance_to_nearest_zero({{0, 1, 1, 1, 1}}), (Matrix{{0, 1, 2, 3, 4}}));
    CHECK_EQ(distance_to_nearest_zero({{1, 1, 0, 1, 1}}), (Matrix{{2, 1, 0, 1, 2}}));
}

TEST(zero_distance_all_zeros) {
    Matrix m(3, std::vector<int>(4, 0));
    CHECK_EQ(distance_to_nearest_zero(m), m);
}

TEST(zero_distance_to_the_nearest_of_two) {
    Matrix m = {{0, 1, 1, 1, 0}};
    CHECK_EQ(distance_to_nearest_zero(m), (Matrix{{0, 1, 2, 1, 0}}));
}

TEST(zero_distance_on_a_big_grid) {
    const int n = 120;
    Matrix m(n, std::vector<int>(n, 1));
    m[0][0] = 0;
    Matrix d = distance_to_nearest_zero(m);
    CHECK_EQ(d[n - 1][n - 1], 2 * (n - 1));
    CHECK_EQ(d[5][7], 12);
}

int main() { return dojo::run_all(); }
