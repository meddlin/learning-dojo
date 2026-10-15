#include "dojo.h"
#include "solution.cpp"

// True if `order` contains every vertex exactly once and all edges go forward.
static bool is_topological(const Graph& g, const std::vector<int>& order) {
    int n = static_cast<int>(g.size());
    if (static_cast<int>(order.size()) != n) return false;
    std::vector<int> pos(n, -1);
    for (int i = 0; i < n; ++i) {
        if (order[i] < 0 || order[i] >= n || pos[order[i]] != -1) return false;
        pos[order[i]] = i;
    }
    for (int u = 0; u < n; ++u)
        for (int v : g[u])
            if (pos[u] >= pos[v]) return false;
    return true;
}

TEST(chain_has_exactly_one_order) {
    Graph g = {{1}, {2}, {3}, {}};
    CHECK_EQ(topo_order(g), (std::vector<int>{0, 1, 2, 3}));
}

TEST(diamond) {
    Graph g = {{1, 2}, {3}, {3}, {}};
    std::vector<int> o = topo_order(g);
    CHECK(is_topological(g, o));
    CHECK_EQ(o.front(), 0);
    CHECK_EQ(o.back(), 3);
}

TEST(independent_vertices_all_appear) {
    Graph g(5);
    std::vector<int> o = topo_order(g);
    CHECK(is_topological(g, o));
}

TEST(edges_listed_against_the_numbering) {
    // 4 -> 3 -> 2 -> 1 -> 0
    Graph g = {{}, {0}, {1}, {2}, {3}};
    CHECK_EQ(topo_order(g), (std::vector<int>{4, 3, 2, 1, 0}));
}

TEST(cycle_gives_empty_result) {
    Graph g = {{1}, {2}, {0}};
    CHECK(topo_order(g).empty());
}

TEST(cycle_hidden_behind_a_valid_prefix) {
    // 0 -> 1 -> 2 -> 3 -> 1
    Graph g = {{1}, {2}, {3}, {1}};
    CHECK(topo_order(g).empty());
}

TEST(self_loop_is_a_cycle) {
    Graph g = {{0}};
    CHECK(topo_order(g).empty());
}

TEST(a_wide_layered_dag) {
    // 6 layers of 30 vertices, every vertex points at every vertex in the next layer.
    const int L = 6, W = 30;
    Graph g(L * W);
    for (int l = 0; l + 1 < L; ++l)
        for (int a = 0; a < W; ++a)
            for (int b = 0; b < W; ++b) g[l * W + a].push_back((l + 1) * W + b);
    CHECK(is_topological(g, topo_order(g)));
}

TEST(courses_that_can_be_finished) {
    CHECK(can_finish(2, {{1, 0}}));
    CHECK(can_finish(4, {{1, 0}, {2, 0}, {3, 1}, {3, 2}}));
    CHECK(can_finish(3, {}));
    CHECK(can_finish(0, {}));
}

TEST(courses_that_cannot_be_finished) {
    CHECK_FALSE(can_finish(2, {{1, 0}, {0, 1}}));
    CHECK_FALSE(can_finish(4, {{1, 0}, {2, 1}, {3, 2}, {1, 3}}));
    CHECK_FALSE(can_finish(1, {{0, 0}}));
}

int main() { return dojo::run_all(); }
