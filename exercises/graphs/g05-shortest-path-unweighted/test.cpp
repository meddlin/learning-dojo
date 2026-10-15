#include "dojo.h"
#include "solution.cpp"

static bool is_edge(const Graph& g, int u, int v) {
    return std::find(g[u].begin(), g[u].end(), v) != g[u].end();
}

// True if p is a walk along real edges from s to t.
static bool valid_path(const Graph& g, const std::vector<int>& p, int s, int t) {
    if (p.empty() || p.front() != s || p.back() != t) return false;
    for (std::size_t i = 0; i + 1 < p.size(); ++i)
        if (!is_edge(g, p[i], p[i + 1])) return false;
    return true;
}

TEST(distances_on_a_path) {
    Graph g = {{1}, {0, 2}, {1, 3}, {2}};
    CHECK_EQ(bfs_dist(g, 0), (std::vector<int>{0, 1, 2, 3}));
    CHECK_EQ(bfs_dist(g, 2), (std::vector<int>{2, 1, 0, 1}));
}

TEST(distances_prefer_the_shortcut) {
    // 0-1-2-3-4 plus a shortcut 0-4.
    Graph g = {{1, 4}, {0, 2}, {1, 3}, {2, 4}, {3, 0}};
    CHECK_EQ(bfs_dist(g, 0), (std::vector<int>{0, 1, 2, 2, 1}));
}

TEST(unreachable_vertices_are_minus_one) {
    Graph g = {{1}, {0}, {3}, {2}, {}};
    CHECK_EQ(bfs_dist(g, 0), (std::vector<int>{0, 1, -1, -1, -1}));
}

TEST(distances_respect_direction) {
    Graph g = {{1}, {2}, {}, {0}};
    CHECK_EQ(bfs_dist(g, 0), (std::vector<int>{0, 1, 2, -1}));
    CHECK_EQ(bfs_dist(g, 3), (std::vector<int>{1, 2, 3, 0}));
}

TEST(path_to_self_is_just_the_start) {
    Graph g = {{1}, {0}};
    CHECK_EQ(shortest_path(g, 1, 1), std::vector<int>{1});
}

TEST(path_on_a_line_is_unique) {
    Graph g = {{1}, {0, 2}, {1, 3}, {2, 4}, {3}};
    CHECK_EQ(shortest_path(g, 0, 4), (std::vector<int>{0, 1, 2, 3, 4}));
    CHECK_EQ(shortest_path(g, 4, 1), (std::vector<int>{4, 3, 2, 1}));
}

TEST(path_is_empty_when_unreachable) {
    Graph g = {{1}, {0}, {3}, {2}};
    CHECK(shortest_path(g, 0, 3).empty());
}

TEST(path_takes_the_shortcut) {
    Graph g = {{1, 4}, {0, 2}, {1, 3}, {2, 4}, {3, 0}};
    std::vector<int> p = shortest_path(g, 0, 3);
    CHECK(valid_path(g, p, 0, 3));
    CHECK_EQ(p.size(), static_cast<std::size_t>(3));  // 0 -> 4 -> 3
}

TEST(path_has_the_right_length_in_a_diamond_chain) {
    // Layers of two parallel vertices: 0 -> {1,2} -> 3 -> {4,5} -> 6 ...
    const int layers = 40;
    int n = 1 + layers * 3;
    Graph g(n);
    int prev = 0;
    for (int l = 0; l < layers; ++l) {
        int a = prev + 1, b = prev + 2, join = prev + 3;
        g[prev].push_back(a);
        g[prev].push_back(b);
        g[a].push_back(join);
        g[b].push_back(join);
        prev = join;
    }
    CHECK_EQ(bfs_dist(g, 0)[prev], layers * 2);
    std::vector<int> p = shortest_path(g, 0, prev);
    CHECK(valid_path(g, p, 0, prev));
    CHECK_EQ(p.size(), static_cast<std::size_t>(layers * 2 + 1));
}

int main() { return dojo::run_all(); }
