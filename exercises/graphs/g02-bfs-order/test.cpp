#include "dojo.h"
#include "solution.cpp"

TEST(bfs_on_a_path) {
    Graph g = {{1}, {0, 2}, {1, 3}, {2}};
    CHECK_EQ(bfs_order(g, 0), (std::vector<int>{0, 1, 2, 3}));
    CHECK_EQ(bfs_order(g, 3), (std::vector<int>{3, 2, 1, 0}));
}

TEST(bfs_on_a_tree_goes_level_by_level) {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    CHECK_EQ(bfs_order(g, 0), (std::vector<int>{0, 1, 2, 3, 4, 5}));
}

TEST(bfs_visits_a_shared_neighbour_once) {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
    CHECK_EQ(bfs_order(g, 0), (std::vector<int>{0, 1, 2, 3}));
}

TEST(bfs_ignores_unreachable_vertices) {
    Graph g = {{1}, {0}, {3}, {2}};
    CHECK_EQ(bfs_order(g, 0), (std::vector<int>{0, 1}));
    CHECK_EQ(bfs_order(g, 2), (std::vector<int>{2, 3}));
}

TEST(bfs_follows_edge_direction) {
    Graph g = {{1}, {2}, {0}, {0}};
    CHECK_EQ(bfs_order(g, 1), (std::vector<int>{1, 2, 0}));
    CHECK_EQ(bfs_order(g, 3), (std::vector<int>{3, 0, 1, 2}));
}

TEST(bfs_single_vertex) {
    CHECK_EQ(bfs_order(Graph{{}}, 0), std::vector<int>{0});
}

TEST(bfs_never_repeats_a_vertex_on_a_dense_graph) {
    const int n = 200;
    Graph g(n);
    for (int u = 0; u < n; ++u)
        for (int v = 0; v < n; ++v)
            if (u != v) g[u].push_back(v);
    std::vector<int> order = bfs_order(g, 7);
    CHECK_EQ(order.size(), static_cast<std::size_t>(n));
    CHECK_EQ(order[0], 7);
    std::vector<int> sorted = order;
    std::sort(sorted.begin(), sorted.end());
    std::vector<int> all(n);
    std::iota(all.begin(), all.end(), 0);
    CHECK_EQ(sorted, all);
}

int main() { return dojo::run_all(); }
