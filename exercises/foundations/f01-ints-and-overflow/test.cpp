#include "dojo.h"
#include "solution.cpp"

TEST(add_overflows_ordinary_values) {
    CHECK_FALSE(add_overflows(1, 2));
    CHECK_FALSE(add_overflows(-5, 3));
    CHECK_FALSE(add_overflows(0, 0));
}

TEST(add_overflows_at_the_top_edge) {
    CHECK_FALSE(add_overflows(INT_MAX, 0));
    CHECK_FALSE(add_overflows(INT_MAX - 1, 1));
    CHECK(add_overflows(INT_MAX, 1));
    CHECK(add_overflows(INT_MAX / 2 + 1, INT_MAX / 2 + 1));
}

TEST(add_overflows_at_the_bottom_edge) {
    CHECK_FALSE(add_overflows(INT_MIN, 0));
    CHECK_FALSE(add_overflows(INT_MIN + 1, -1));
    CHECK(add_overflows(INT_MIN, -1));
    CHECK(add_overflows(INT_MIN, INT_MIN));
}

TEST(add_overflows_opposite_signs_never_overflow) {
    CHECK_FALSE(add_overflows(INT_MAX, INT_MIN));
    CHECK_FALSE(add_overflows(INT_MIN, INT_MAX));
}

TEST(digit_sum_positive) {
    CHECK_EQ(digit_sum(0), 0);
    CHECK_EQ(digit_sum(7), 7);
    CHECK_EQ(digit_sum(482), 14);
    CHECK_EQ(digit_sum(1000), 1);
}

TEST(digit_sum_negative) {
    CHECK_EQ(digit_sum(-482), 14);
    CHECK_EQ(digit_sum(-1), 1);
}

TEST(digit_sum_extremes) {
    CHECK_EQ(digit_sum(INT_MAX), 46);
    CHECK_EQ(digit_sum(INT_MIN), 47);
}

TEST(rotate_left_basic) {
    CHECK_EQ(rotate_left(0x80000001u, 1), 0x00000003u);
    CHECK_EQ(rotate_left(0xF0000000u, 4), 0x0000000Fu);
    CHECK_EQ(rotate_left(1u, 31), 0x80000000u);
}

TEST(rotate_left_zero_and_full_turns) {
    CHECK_EQ(rotate_left(0x12345678u, 0), 0x12345678u);
    CHECK_EQ(rotate_left(0x12345678u, 32), 0x12345678u);
    CHECK_EQ(rotate_left(0x12345678u, 64), 0x12345678u);
}

TEST(rotate_left_wraps_large_counts) {
    CHECK_EQ(rotate_left(0x12345678u, 33), 0x2468ACF0u);
    CHECK_EQ(rotate_left(0x12345678u, 36), 0x23456781u);
}

int main() { return dojo::run_all(); }
