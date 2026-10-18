#include "dojo.h"
#include "solution.cpp"

TEST(undirected_tree_has_no_cycle) {
    Graph g = {{1, 2}, {0, 3, 4}, {0}, {1}, {1}};
    CHECK_FALSE(has_cycle_undirected(g));
}

TEST(undirected_triangle_is_a_cycle) {
    Graph g = {{1, 2}, {0, 2}, {0, 1}};
    CHECK(has_cycle_undirected(g));
}

TEST(undirected_single_edge_is_not_a_cycle) {
    Graph g = {{1}, {0}};
    CHECK_FALSE(has_cycle_undirected(g));
}

TEST(undirected_cycle_hidden_in_a_second_component) {
    // component {0,1,2} is a path; component {3,4,5} is a triangle.
    Graph g = {{1}, {0, 2}, {1}, {4, 5}, {3, 5}, {3, 4}};
    CHECK(has_cycle_undirected(g));
}

TEST(undirected_empty_and_isolated) {
    CHECK_FALSE(has_cycle_undirected(Graph{}));
    CHECK_FALSE(has_cycle_undirected(Graph(4)));
}

TEST(undirected_long_cycle_and_long_path) {
    const int n = 500;
    Graph path(n), ring(n);
    for (int i = 0; i + 1 < n; ++i) {
        path[i].push_back(i + 1);
        path[i + 1].push_back(i);
        ring[i].push_back(i + 1);
        ring[i + 1].push_back(i);
    }
    ring[n - 1].push_back(0);
    ring[0].push_back(n - 1);
    CHECK_FALSE(has_cycle_undirected(path));
    CHECK(has_cycle_undirected(ring));
}

TEST(directed_simple_cycle) {
    Graph g = {{1}, {2}, {0}};
    CHECK(has_cycle_directed(g));
}

TEST(directed_dag_with_shared_descendant_is_acyclic) {
    // 0->1, 0->2, 1->3, 2->3: vertex 3 is reached twice, but no cycle.
    Graph g = {{1, 2}, {3}, {3}, {}};
    CHECK_FALSE(has_cycle_directed(g));
}

TEST(directed_self_loop) {
    Graph g = {{}, {1}};
    CHECK(has_cycle_directed(g));
}

TEST(directed_two_cycle) {
    Graph g = {{1}, {0}};
    CHECK(has_cycle_directed(g));
}

TEST(directed_cycle_unreachable_from_vertex_zero) {
    Graph g = {{1}, {}, {3}, {2}};
    CHECK(has_cycle_directed(g));
}

TEST(directed_empty_and_chain) {
    CHECK_FALSE(has_cycle_directed(Graph{}));
    const int n = 2000;
    Graph chain(n);
    for (int i = 0; i + 1 < n; ++i) chain[i].push_back(i + 1);
    CHECK_FALSE(has_cycle_directed(chain));
    chain[n - 1].push_back(n / 2);
    CHECK(has_cycle_directed(chain));
}

int main() { return dojo::run_all(); }
