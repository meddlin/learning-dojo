#include "dojo.h"
#include "solution.cpp"

// O(V^2) Dijkstra with no heap: slow but obviously correct.
static std::vector<long long> slow_dijkstra(const WGraph& g, int start) {
    int n = static_cast<int>(g.size());
    std::vector<long long> dist(n, INF);
    std::vector<bool> done(n, false);
    dist[start] = 0;
    for (int round = 0; round < n; ++round) {
        int u = -1;
        for (int v = 0; v < n; ++v)
            if (!done[v] && dist[v] < INF && (u == -1 || dist[v] < dist[u])) u = v;
        if (u == -1) break;
        done[u] = true;
        for (auto [v, w] : g[u]) dist[v] = std::min(dist[v], dist[u] + w);
    }
    return dist;
}

static long long cheapest_edge(const WGraph& g, int u, int v) {
    long long best = -1;
    for (auto [x, w] : g[u])
        if (x == v && (best == -1 || w < best)) best = w;
    return best;
}

// Cost of walking `p` along real edges, or -1 if some step is not an edge.
static long long path_cost(const WGraph& g, const std::vector<int>& p) {
    long long total = 0;
    for (std::size_t i = 0; i + 1 < p.size(); ++i) {
        long long w = cheapest_edge(g, p[i], p[i + 1]);
        if (w < 0) return -1;
        total += w;
    }
    return total;
}

static WGraph random_graph(int n, int m, unsigned seed, int max_w) {
    WGraph g(n);
    unsigned long long s = seed;
    auto next = [&]() {
        s = s * 6364136223846793005ULL + 1442695040888963407ULL;
        return static_cast<unsigned>(s >> 33);
    };
    for (int i = 0; i < m; ++i) {
        int u = static_cast<int>(next() % n), v = static_cast<int>(next() % n);
        long long w = static_cast<long long>(next() % max_w);
        g[u].push_back({v, w});
    }
    return g;
}

TEST(small_example_with_a_detour) {
    WGraph g(4);
    g[0] = {{1, 4}, {2, 1}};
    g[2] = {{1, 2}, {3, 7}};
    g[1] = {{3, 1}};
    CHECK_EQ(dijkstra(g, 0), (std::vector<long long>{0, 3, 1, 4}));
}

TEST(fewest_edges_is_not_cheapest) {
    // Direct edge costs 100; the 3-hop route costs 3.
    WGraph g(4);
    g[0] = {{3, 100}, {1, 1}};
    g[1] = {{2, 1}};
    g[2] = {{3, 1}};
    CHECK_EQ(dijkstra(g, 0)[3], 3LL);
}

TEST(unreachable_is_INF) {
    WGraph g(3);
    g[0] = {{1, 5}};
    std::vector<long long> d = dijkstra(g, 0);
    CHECK_EQ(d[1], 5LL);
    CHECK_EQ(d[2], INF);
}

TEST(edges_are_directed) {
    WGraph g(2);
    g[0] = {{1, 3}};
    CHECK_EQ(dijkstra(g, 1)[0], INF);
}

TEST(zero_weight_edges_and_parallel_edges) {
    WGraph g(3);
    g[0] = {{1, 0}, {1, 9}, {2, 5}};
    g[1] = {{2, 0}};
    CHECK_EQ(dijkstra(g, 0), (std::vector<long long>{0, 0, 0}));
}

TEST(large_weights_add_up_correctly) {
    WGraph g(4);
    const long long big = 400'000'000'000'000'000LL;  // 4e17
    g[0] = {{1, big}};
    g[1] = {{2, big}};
    std::vector<long long> d = dijkstra(g, 0);
    CHECK_EQ(d[1], big);
    CHECK_EQ(d[2], 2 * big);
    CHECK_EQ(d[3], INF);
}

TEST(matches_the_slow_version_on_random_graphs) {
    for (unsigned seed = 1; seed <= 12; ++seed) {
        int n = 5 + static_cast<int>(seed) * 7;
        WGraph g = random_graph(n, n * 3, seed, 50);
        INFO("seed " + std::to_string(seed));
        CHECK_EQ(dijkstra(g, 0), slow_dijkstra(g, 0));
    }
}

TEST(a_big_graph_finishes_quickly) {
    WGraph g = random_graph(20000, 100000, 99, 1000);
    std::vector<long long> d = dijkstra(g, 0);
    CHECK_EQ(d[0], 0LL);
    CHECK_EQ(d.size(), static_cast<std::size_t>(20000));
}

TEST(path_to_self) {
    WGraph g(2);
    g[0] = {{1, 1}};
    CHECK_EQ(dijkstra_path(g, 0, 0), std::vector<int>{0});
}

TEST(path_is_empty_when_unreachable) {
    WGraph g(3);
    g[0] = {{1, 1}};
    CHECK(dijkstra_path(g, 0, 2).empty());
}

TEST(path_follows_the_cheap_route) {
    WGraph g(4);
    g[0] = {{1, 4}, {2, 1}};
    g[2] = {{1, 2}, {3, 7}};
    g[1] = {{3, 1}};
    CHECK_EQ(dijkstra_path(g, 0, 3), (std::vector<int>{0, 2, 1, 3}));
}

TEST(paths_are_real_and_cost_exactly_the_distance) {
    for (unsigned seed = 20; seed < 28; ++seed) {
        WGraph g = random_graph(60, 200, seed, 30);
        std::vector<long long> d = slow_dijkstra(g, 0);
        for (int t = 0; t < 60; ++t) {
            std::vector<int> p = dijkstra_path(g, 0, t);
            INFO("seed " + std::to_string(seed) + ", target " + std::to_string(t));
            if (d[t] >= INF) {
                CHECK(p.empty());
            } else {
                CHECK(!p.empty());
                if (p.empty()) continue;
                CHECK_EQ(p.front(), 0);
                CHECK_EQ(p.back(), t);
                CHECK_EQ(path_cost(g, p), d[t]);
            }
        }
    }
}

int main() { return dojo::run_all(); }
