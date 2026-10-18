#include "dojo.h"
#include "solution.cpp"

TEST(everyone_starts_alone) {
    DSU d(5);
    CHECK_EQ(d.components(), 5);
    for (int i = 0; i < 5; ++i) {
        CHECK_EQ(d.find(i), i);
        CHECK_EQ(d.size_of(i), 1);
    }
}

TEST(unite_merges_and_reports) {
    DSU d(6);
    CHECK(d.unite(0, 1));
    CHECK(d.unite(2, 3));
    CHECK_FALSE(d.unite(1, 0));
    CHECK_EQ(d.components(), 4);
    CHECK_EQ(d.find(0), d.find(1));
    CHECK_EQ(d.find(2), d.find(3));
    CHECK(d.find(0) != d.find(2));
}

TEST(sizes_follow_the_groups) {
    DSU d(6);
    d.unite(0, 1);
    d.unite(1, 2);
    d.unite(4, 5);
    CHECK_EQ(d.size_of(0), 3);
    CHECK_EQ(d.size_of(2), 3);
    CHECK_EQ(d.size_of(4), 2);
    CHECK_EQ(d.size_of(3), 1);
    d.unite(2, 5);
    CHECK_EQ(d.size_of(0), 5);
    CHECK_EQ(d.size_of(4), 5);
}

TEST(transitive_merging) {
    DSU d(8);
    d.unite(0, 1);
    d.unite(2, 3);
    d.unite(1, 2);
    CHECK_EQ(d.find(0), d.find(3));
    CHECK_FALSE(d.unite(0, 3));
    CHECK_EQ(d.components(), 5);
}

TEST(a_long_chain_stays_fast) {
    const int n = 50000;
    DSU d(n);
    for (int i = 0; i + 1 < n; ++i) CHECK(d.unite(i, i + 1));
    CHECK_EQ(d.components(), 1);
    CHECK_EQ(d.size_of(0), n);
    int root = d.find(0);
    for (int i = 0; i < n; ++i)
        if (d.find(i) != root) {
            CHECK(false);
            break;
        }
}

TEST(mst_of_a_small_graph) {
    // Square 0-1-2-3 with a heavy diagonal.
    std::vector<Edge> e = {{0, 1, 1}, {1, 2, 2}, {2, 3, 1}, {3, 0, 4}, {0, 2, 10}};
    CHECK_EQ(mst_weight(4, e), 4LL);
}

TEST(mst_picks_cheap_edges_not_the_first_ones) {
    std::vector<Edge> e = {{0, 1, 100}, {1, 2, 100}, {0, 2, 1}, {2, 3, 1}, {1, 3, 1}};
    CHECK_EQ(mst_weight(4, e), 3LL);
}

TEST(mst_of_a_disconnected_graph_is_minus_one) {
    std::vector<Edge> e = {{0, 1, 1}, {2, 3, 1}};
    CHECK_EQ(mst_weight(4, e), -1LL);
}

TEST(mst_trivial_sizes) {
    CHECK_EQ(mst_weight(1, {}), 0LL);
    CHECK_EQ(mst_weight(2, {{0, 1, 7}}), 7LL);
    CHECK_EQ(mst_weight(2, {}), -1LL);
}

TEST(mst_handles_large_weights_without_overflow) {
    const long long big = 3'000'000'000LL;
    CHECK_EQ(mst_weight(3, {{0, 1, big}, {1, 2, big}, {0, 2, big}}), 2 * big);
}

int main() { return dojo::run_all(); }
