#include "dojo.h"
#include "solution.cpp"

TEST(k_smallest_basic) {
    CHECK_EQ(k_smallest({5, 1, 4, 2, 3}, 3), (std::vector<int>{1, 2, 3}));
    CHECK_EQ(k_smallest({9, 8, 7}, 3), (std::vector<int>{7, 8, 9}));
}

TEST(k_smallest_edge_cases) {
    CHECK_EQ(k_smallest({3, 1, 2}, 0), std::vector<int>{});
    CHECK_EQ(k_smallest({}, 0), std::vector<int>{});
    CHECK_EQ(k_smallest({2, 2, 1}, 2), (std::vector<int>{1, 2}));
    CHECK_EQ(k_smallest({-1, -5, 4}, 2), (std::vector<int>{-5, -1}));
}

TEST(k_smallest_large_input) {
    std::vector<int> v;
    unsigned x = 12345;
    for (int i = 0; i < 100000; ++i) {
        x = x * 1664525u + 1013904223u;
        v.push_back(static_cast<int>(x >> 8) % 100000);
    }
    std::vector<int> sorted = v;
    std::sort(sorted.begin(), sorted.end());
    CHECK_EQ(k_smallest(v, 5), std::vector<int>(sorted.begin(), sorted.begin() + 5));
}

TEST(merge_sorted_lists_basic) {
    CHECK_EQ(merge_sorted_lists({{1, 4, 7}, {2, 5}, {}, {0, 9}}), (std::vector<int>{0, 1, 2, 4, 5, 7, 9}));
}

TEST(merge_sorted_lists_edge_cases) {
    CHECK_EQ(merge_sorted_lists({}), std::vector<int>{});
    CHECK_EQ(merge_sorted_lists({{}, {}}), std::vector<int>{});
    CHECK_EQ(merge_sorted_lists({{1, 2, 3}}), (std::vector<int>{1, 2, 3}));
    CHECK_EQ(merge_sorted_lists({{1, 1}, {1}}), (std::vector<int>{1, 1, 1}));
}

TEST(sort_by_distance_with_ties) {
    using P = std::pair<int, int>;
    std::vector<P> in{{3, 4}, {1, 1}, {0, 0}, {-1, 1}, {1, -1}};
    std::vector<P> want{{0, 0}, {-1, 1}, {1, -1}, {1, 1}, {3, 4}};
    CHECK_EQ(sort_by_distance(in), want);
}

TEST(sort_by_distance_edge_cases) {
    using P = std::pair<int, int>;
    CHECK_EQ(sort_by_distance({}), std::vector<P>{});
    CHECK_EQ(sort_by_distance({{2, 0}}), std::vector<P>{{2, 0}});
    CHECK_EQ(sort_by_distance({{0, 3}, {3, 0}, {0, -3}}), (std::vector<P>{{0, -3}, {0, 3}, {3, 0}}));
}

int main() { return dojo::run_all(); }
