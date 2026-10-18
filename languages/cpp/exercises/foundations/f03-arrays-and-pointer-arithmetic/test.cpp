#include "dojo.h"
#include "solution.cpp"

TEST(sum_range_whole_and_partial) {
    std::vector<int> v{1, 2, 3, 4, 5};
    CHECK_EQ(sum_range(v.data(), v.data() + 5), 15);
    CHECK_EQ(sum_range(v.data() + 1, v.data() + 4), 9);
}

TEST(sum_range_empty_ranges) {
    std::vector<int> v{1, 2, 3};
    CHECK_EQ(sum_range(v.data(), v.data()), 0);
    CHECK_EQ(sum_range(v.data() + 3, v.data() + 3), 0);
    std::vector<int> empty;
    CHECK_EQ(sum_range(empty.data(), empty.data()), 0);
}

TEST(sum_range_handles_negatives) {
    std::vector<int> v{-3, 3, -10, 4};
    CHECK_EQ(sum_range(v.data(), v.data() + 4), -6);
}

TEST(reverse_in_place_even_length) {
    std::vector<int> v{1, 2, 3, 4};
    reverse_in_place(v.data(), 4);
    CHECK_EQ(v, std::vector<int>{4, 3, 2, 1});
}

TEST(reverse_in_place_odd_length) {
    std::vector<int> v{1, 2, 3, 4, 5};
    reverse_in_place(v.data(), 5);
    CHECK_EQ(v, std::vector<int>{5, 4, 3, 2, 1});
}

TEST(reverse_in_place_tiny_inputs) {
    std::vector<int> one{9};
    reverse_in_place(one.data(), 1);
    CHECK_EQ(one, std::vector<int>{9});
    std::vector<int> none;
    reverse_in_place(none.data(), 0);
    CHECK_EQ(none.size(), 0u);
}

static void check_partition(std::vector<int> v) {
    std::vector<int> before = v;
    std::sort(before.begin(), before.end());
    INFO(dojo::show(v));
    int* first_odd = partition_evens(v.data(), v.data() + v.size());
    std::ptrdiff_t k = first_odd - v.data();
    CHECK(k >= 0 && k <= static_cast<std::ptrdiff_t>(v.size()));
    for (std::ptrdiff_t i = 0; i < k; ++i) CHECK(v[i] % 2 == 0);
    for (std::ptrdiff_t i = k; i < static_cast<std::ptrdiff_t>(v.size()); ++i) CHECK(v[i] % 2 != 0);
    std::vector<int> after = v;
    std::sort(after.begin(), after.end());
    CHECK_EQ(after, before);
}

TEST(partition_evens_mixed) {
    check_partition({1, 2, 3, 4, 5, 6});
    check_partition({2, 1});
    check_partition({7, 7, 2, 2, 7, 2, 9, 4});
}

TEST(partition_evens_one_kind_only) {
    check_partition({2, 4, 6});
    check_partition({1, 3, 5});
}

TEST(partition_evens_negatives_and_tiny) {
    check_partition({-3, -2, -1, 0, 1, 2});
    check_partition({});
    check_partition({5});
    check_partition({8});
}

TEST(partition_evens_returns_end_when_no_odds) {
    std::vector<int> v{2, 4};
    CHECK(partition_evens(v.data(), v.data() + 2) == v.data() + 2);
}

int main() { return dojo::run_all(); }
