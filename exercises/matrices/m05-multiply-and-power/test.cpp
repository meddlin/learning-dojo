#include "dojo.h"
#include "solution.cpp"

TEST(identity_matrix) {
    CHECK_EQ(identity(1), (Mat{{1}}));
    CHECK_EQ(identity(3), (Mat{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}));
}

TEST(multiply_two_by_two) {
    Mat a = {{1, 2}, {3, 4}};
    Mat b = {{5, 6}, {7, 8}};
    CHECK_EQ(multiply(a, b), (Mat{{19, 22}, {43, 50}}));
}

TEST(multiplication_is_not_commutative) {
    Mat a = {{1, 2}, {3, 4}};
    Mat b = {{5, 6}, {7, 8}};
    CHECK_EQ(multiply(b, a), (Mat{{23, 34}, {31, 46}}));
}

TEST(multiply_rectangular_matrices) {
    Mat a = {{1, 2, 3}, {4, 5, 6}};      // 2 x 3
    Mat b = {{7, 8}, {9, 10}, {11, 12}}; // 3 x 2
    CHECK_EQ(multiply(a, b), (Mat{{58, 64}, {139, 154}}));
    CHECK_EQ(multiply(b, a), (Mat{{39, 54, 69}, {49, 68, 87}, {59, 82, 105}}));
}

TEST(multiply_by_a_column_vector) {
    Mat a = {{1, 2}, {3, 4}};
    Mat v = {{5}, {6}};
    CHECK_EQ(multiply(a, v), (Mat{{17}, {39}}));
}

TEST(identity_is_neutral) {
    Mat a = {{2, -1, 0}, {5, 7, 3}, {1, 1, 1}};
    CHECK_EQ(multiply(a, identity(3)), a);
    CHECK_EQ(multiply(identity(3), a), a);
}

TEST(multiplication_is_associative) {
    Mat a = {{1, 2}, {3, 4}}, b = {{0, 1}, {1, 1}}, c = {{2, 0}, {1, 3}};
    CHECK_EQ(multiply(multiply(a, b), c), multiply(a, multiply(b, c)));
}

TEST(power_zero_and_one) {
    Mat a = {{2, 1}, {1, 1}};
    CHECK_EQ(mat_pow(a, 0), identity(2));
    CHECK_EQ(mat_pow(a, 1), a);
}

TEST(small_powers_match_repeated_multiplication) {
    Mat a = {{1, 1, 0}, {0, 1, 1}, {1, 0, 1}};
    Mat expected = identity(3);
    for (int e = 0; e <= 12; ++e) {
        INFO("exponent " + std::to_string(e));
        CHECK_EQ(mat_pow(a, e), expected);
        expected = multiply(expected, a);
    }
}

TEST(huge_exponent_needs_logarithmic_work) {
    // Identity^huge and a swap matrix^huge are cheap if you square; hopeless if you loop.
    CHECK_EQ(mat_pow(identity(2), 1'000'000'000'000'000LL), identity(2));
    Mat swap = {{0, 1}, {1, 0}};
    CHECK_EQ(mat_pow(swap, 1'000'000'000'000'000LL), identity(2));
    CHECK_EQ(mat_pow(swap, 1'000'000'000'000'001LL), swap);
}

TEST(fibonacci_small_values) {
    std::vector<long long> want = {0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55};
    for (int n = 0; n <= 10; ++n) {
        INFO("n = " + std::to_string(n));
        CHECK_EQ(fibonacci(n), want[n]);
    }
}

TEST(fibonacci_large_values) {
    CHECK_EQ(fibonacci(50), 12586269025LL);
    CHECK_EQ(fibonacci(90), 2880067194370816120LL);
}

int main() { return dojo::run_all(); }
