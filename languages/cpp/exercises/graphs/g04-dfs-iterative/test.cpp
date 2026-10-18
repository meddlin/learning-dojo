#include "dojo.h"
#include "solution.cpp"

// Recursive reference used for comparison.
static void rec(const Graph& g, int u, std::vector<bool>& seen, std::vector<int>& out) {
    seen[u] = true;
    out.push_back(u);
    for (int v : g[u])
        if (!seen[v]) rec(g, v, seen, out);
}

static std::vector<int> recursive_dfs(const Graph& g, int start) {
    std::vector<bool> seen(g.size(), false);
    std::vector<int> out;
    rec(g, start, seen, out);
    return out;
}

TEST(matches_the_hand_computed_order) {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    CHECK_EQ(dfs_order_iterative(g, 0), (std::vector<int>{0, 1, 3, 4, 2, 5}));
}

TEST(handles_cycles_and_shared_neighbours) {
    Graph g = {{1, 2}, {0, 3}, {0, 3}, {1, 2}};
    CHECK_EQ(dfs_order_iterative(g, 0), (std::vector<int>{0, 1, 3, 2}));
}

TEST(follows_directed_edges) {
    Graph g = {{1}, {2}, {0}, {0}};
    CHECK_EQ(dfs_order_iterative(g, 1), (std::vector<int>{1, 2, 0}));
}

TEST(single_vertex_and_unreachable_parts) {
    CHECK_EQ(dfs_order_iterative(Graph{{}}, 0), std::vector<int>{0});
    Graph g = {{1}, {0}, {3}, {2}};
    CHECK_EQ(dfs_order_iterative(g, 0), (std::vector<int>{0, 1}));
}

TEST(matches_recursion_on_random_graphs) {
    unsigned state = 2024;
    auto next = [&]() {
        state = state * 1664525u + 1013904223u;
        return state >> 8;
    };
    for (int round = 0; round < 40; ++round) {
        int n = 5 + static_cast<int>(next() % 60);
        int m = static_cast<int>(next() % (3 * n));
        Graph g(n);
        for (int e = 0; e < m; ++e) {
            int u = static_cast<int>(next() % n);
            int v = static_cast<int>(next() % n);
            g[u].push_back(v);
            if (round % 2 == 0) g[v].push_back(u);
        }
        for (int start = 0; start < n; start += 7) {
            INFO("round " + std::to_string(round) + ", start " + std::to_string(start));
            CHECK_EQ(dfs_order_iterative(g, start), recursive_dfs(g, start));
        }
    }
}

TEST(survives_a_path_too_long_for_recursion) {
    const int n = 200000;
    Graph g(n);
    for (int i = 0; i + 1 < n; ++i) g[i].push_back(i + 1);
    std::vector<int> order = dfs_order_iterative(g, 0);
    CHECK_EQ(order.size(), static_cast<std::size_t>(n));
    CHECK_EQ(order.back(), n - 1);
}

int main() { return dojo::run_all(); }
