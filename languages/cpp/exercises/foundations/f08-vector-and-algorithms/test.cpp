#include "dojo.h"
#include "solution.cpp"

TEST(evens_squared_basic) {
    CHECK_EQ(evens_squared({1, 2, 3, 4, 5, 6}), std::vector<int>{4, 16, 36});
}

TEST(evens_squared_edge_cases) {
    CHECK_EQ(evens_squared({}), std::vector<int>{});
    CHECK_EQ(evens_squared({1, 3, 5}), std::vector<int>{});
    CHECK_EQ(evens_squared({-2, -3, 0}), std::vector<int>{4, 0});
}

TEST(max_value_basic) {
    CHECK_EQ(max_value({3, 9, 2}), 9);
    CHECK_EQ(max_value({7}), 7);
}

TEST(max_value_negatives_and_empty) {
    CHECK_EQ(max_value({-5, -2, -9}), -2);
    CHECK_EQ(max_value({}), std::numeric_limits<int>::min());
}

TEST(sort_by_length_is_stable) {
    std::vector<std::string> in{"ccc", "a", "bb", "d", "ee"};
    CHECK_EQ(sort_by_length(in), (std::vector<std::string>{"a", "d", "bb", "ee", "ccc"}));
}

TEST(sort_by_length_edge_cases) {
    CHECK_EQ(sort_by_length({}), std::vector<std::string>{});
    CHECK_EQ(sort_by_length({"zz", "yy", "xx"}), (std::vector<std::string>{"zz", "yy", "xx"}));
}

TEST(remove_value_removes_all_matches) {
    std::vector<int> v{1, 2, 1, 3, 1};
    remove_value(v, 1);
    CHECK_EQ(v, std::vector<int>{2, 3});
}

TEST(remove_value_edge_cases) {
    std::vector<int> a{4, 5};
    remove_value(a, 9);
    CHECK_EQ(a, std::vector<int>{4, 5});
    std::vector<int> b{7, 7, 7};
    remove_value(b, 7);
    CHECK_EQ(b.size(), 0u);
    std::vector<int> c;
    remove_value(c, 1);
    CHECK_EQ(c.size(), 0u);
}

TEST(average_basic) {
    CHECK_NEAR(average({1, 2, 3, 4}), 2.5, 1e-9);
    CHECK_NEAR(average({5}), 5.0, 1e-9);
    CHECK_NEAR(average({}), 0.0, 1e-9);
}

TEST(average_does_not_overflow) {
    CHECK_NEAR(average({2000000000, 2000000000, 2000000000}), 2000000000.0, 1e-3);
}

int main() { return dojo::run_all(); }
