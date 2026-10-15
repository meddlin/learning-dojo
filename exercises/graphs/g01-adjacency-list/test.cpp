#include "dojo.h"
#include "solution.cpp"

TEST(build_graph_undirected_stores_both_directions) {
    Graph g = build_graph(4, {{0, 1}, {0, 2}, {2, 3}}, false);
    CHECK_EQ(g, Graph{{1, 2}, {0}, {0, 3}, {2}});
}

TEST(build_graph_directed_stores_one_direction) {
    Graph g = build_graph(4, {{0, 1}, {0, 2}, {2, 3}}, true);
    CHECK_EQ(g, Graph{{1, 2}, {}, {3}, {}});
}

TEST(build_graph_keeps_isolated_vertices) {
    Graph g = build_graph(3, {}, false);
    CHECK_EQ(g.size(), 3u);
    CHECK_EQ(g, Graph{{}, {}, {}});
}

TEST(build_graph_keeps_edge_order) {
    Graph g = build_graph(4, {{0, 3}, {0, 1}, {0, 2}}, true);
    CHECK_EQ(g[0], (std::vector<int>{3, 1, 2}));
}

TEST(out_degree_counts_leaving_edges) {
    Graph g = {{1, 2, 3}, {}, {0}, {2, 2}};
    CHECK_EQ(out_degree(g, 0), 3);
    CHECK_EQ(out_degree(g, 1), 0);
    CHECK_EQ(out_degree(g, 2), 1);
    CHECK_EQ(out_degree(g, 3), 2);
}

TEST(in_degrees_counts_entering_edges) {
    Graph g = {{1, 2}, {}, {1}};
    CHECK_EQ(in_degrees(g), (std::vector<int>{0, 2, 1}));
}

TEST(in_degrees_of_empty_and_isolated) {
    CHECK_EQ(in_degrees(Graph{}), std::vector<int>{});
    CHECK_EQ(in_degrees(Graph{{}, {}}), (std::vector<int>{0, 0}));
}

TEST(has_edge_respects_direction) {
    Graph g = build_graph(3, {{0, 1}, {1, 2}}, true);
    CHECK(has_edge(g, 0, 1));
    CHECK_FALSE(has_edge(g, 1, 0));
    CHECK(has_edge(g, 1, 2));
    CHECK_FALSE(has_edge(g, 0, 2));
}

int main() { return dojo::run_all(); }
