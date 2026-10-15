#include "dojo.h"
#include "solution.cpp"

TEST(dfs_dives_before_backtracking) {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    CHECK_EQ(dfs_order(g, 0), (std::vector<int>{0, 1, 3, 4, 2, 5}));
}

TEST(dfs_with_a_cycle_visits_each_vertex_once) {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
    CHECK_EQ(dfs_order(g, 0), (std::vector<int>{0, 1, 3, 2}));
}

TEST(dfs_follows_directed_edges) {
    Graph g = {{1}, {2}, {0}};
    CHECK_EQ(dfs_order(g, 0), (std::vector<int>{0, 1, 2}));
    CHECK_EQ(dfs_order(g, 1), (std::vector<int>{1, 2, 0}));
}

TEST(dfs_only_reaches_the_start_component) {
    Graph g = {{1}, {0}, {3}, {2}};
    CHECK_EQ(dfs_order(g, 2), (std::vector<int>{2, 3}));
}

TEST(dfs_single_vertex) {
    CHECK_EQ(dfs_order(Graph{{}}, 0), std::vector<int>{0});
}

TEST(dfs_handles_a_long_path) {
    const int n = 5000;
    Graph g(n);
    for (int i = 0; i + 1 < n; ++i) {
        g[i].push_back(i + 1);
        g[i + 1].push_back(i);
    }
    std::vector<int> order = dfs_order(g, 0);
    CHECK_EQ(order.size(), static_cast<std::size_t>(n));
    CHECK_EQ(order.front(), 0);
    CHECK_EQ(order.back(), n - 1);
}

TEST(reachable_follows_direction) {
    Graph g = {{1}, {2}, {}};
    CHECK(reachable(g, 0, 2));
    CHECK_FALSE(reachable(g, 2, 0));
    CHECK(reachable(g, 1, 1));
}

TEST(reachable_across_components) {
    Graph g = {{1}, {0}, {3}, {2}};
    CHECK_FALSE(reachable(g, 0, 3));
    CHECK(reachable(g, 3, 2));
}

int main() { return dojo::run_all(); }
