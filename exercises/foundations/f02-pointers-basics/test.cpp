#include "dojo.h"
#include "solution.cpp"

TEST(swap_ints_swaps_values) {
    int a = 1, b = 2;
    swap_ints(&a, &b);
    CHECK_EQ(a, 2);
    CHECK_EQ(b, 1);
}

TEST(swap_ints_with_itself_is_harmless) {
    int x = 7;
    swap_ints(&x, &x);
    CHECK_EQ(x, 7);
}

TEST(min_max_finds_extremes) {
    int v[] = {4, -2, 9, 0, 9};
    int lo = 0, hi = 0;
    min_max(v, 5, &lo, &hi);
    CHECK_EQ(lo, -2);
    CHECK_EQ(hi, 9);
}

TEST(min_max_single_element) {
    int v[] = {42};
    int lo = 0, hi = 0;
    min_max(v, 1, &lo, &hi);
    CHECK_EQ(lo, 42);
    CHECK_EQ(hi, 42);
}

TEST(min_max_all_negative) {
    int v[] = {-5, -3, -9};
    int lo = 0, hi = 0;
    min_max(v, 3, &lo, &hi);
    CHECK_EQ(lo, -9);
    CHECK_EQ(hi, -3);
}

TEST(bump_if_positive_rules) {
    int p = 4;
    CHECK(bump_if_positive(&p));
    CHECK_EQ(p, 5);
    int zero = 0;
    CHECK_FALSE(bump_if_positive(&zero));
    CHECK_EQ(zero, 0);
    int neg = -3;
    CHECK_FALSE(bump_if_positive(&neg));
    CHECK_EQ(neg, -3);
}

TEST(bump_if_positive_survives_null) {
    CHECK_FALSE(bump_if_positive(nullptr));
}

TEST(find_first_returns_pointer_into_array) {
    int v[] = {5, 8, 8, 1};
    int* p = find_first(v, 4, 8);
    CHECK(p == &v[1]);
    if (p == &v[1]) {
        *p = 100;
        CHECK_EQ(v[1], 100);
    }
}

TEST(find_first_missing_is_nullptr) {
    int v[] = {1, 2, 3};
    CHECK(find_first(v, 3, 9) == nullptr);
    CHECK(find_first(v, 0, 1) == nullptr);
}

int main() { return dojo::run_all(); }
