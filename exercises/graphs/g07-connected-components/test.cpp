#include "dojo.h"
#include "solution.cpp"

using G = std::vector<std::string>;

TEST(components_of_an_empty_graph) {
    CHECK_EQ(count_components(Graph{}), 0);
}

TEST(a_connected_graph_is_one_component) {
    Graph g = {{1, 2}, {0, 2}, {0, 1, 3}, {2}};
    CHECK_EQ(count_components(g), 1);
}

TEST(isolated_vertices_each_count) {
    Graph g(5);
    CHECK_EQ(count_components(g), 5);
}

TEST(mixed_components) {
    // {0,1}, {2,3,4}, {5}
    Graph g = {{1}, {0}, {3}, {2, 4}, {3}, {}};
    CHECK_EQ(count_components(g), 3);
}

TEST(components_in_a_long_path_and_many_pairs) {
    const int n = 1000;
    Graph path(n);
    for (int i = 0; i + 1 < n; ++i) {
        path[i].push_back(i + 1);
        path[i + 1].push_back(i);
    }
    CHECK_EQ(count_components(path), 1);
    Graph pairs(n);
    for (int i = 0; i < n; i += 2) {
        pairs[i].push_back(i + 1);
        pairs[i + 1].push_back(i);
    }
    CHECK_EQ(count_components(pairs), n / 2);
}

TEST(islands_basic) {
    G m = {"11000", "11000", "00100", "00011"};
    CHECK_EQ(num_islands(m), 3);
    CHECK_EQ(largest_island(m), 4);
}

TEST(diagonals_do_not_connect) {
    G m = {"10", "01"};
    CHECK_EQ(num_islands(m), 2);
    CHECK_EQ(largest_island(m), 1);
}

TEST(no_land_and_empty_grids) {
    CHECK_EQ(num_islands({"000", "000"}), 0);
    CHECK_EQ(largest_island({"000", "000"}), 0);
    CHECK_EQ(num_islands({}), 0);
    CHECK_EQ(largest_island({}), 0);
}

TEST(all_land_is_one_island) {
    G m(10, std::string(7, '1'));
    CHECK_EQ(num_islands(m), 1);
    CHECK_EQ(largest_island(m), 70);
}

TEST(the_input_grid_is_not_modified) {
    G m = {"110", "001", "101"};
    G copy = m;
    num_islands(m);
    largest_island(m);
    CHECK_EQ(m, copy);
}

TEST(a_big_serpentine_island) {
    const int n = 150;
    G m(n, std::string(n, '1'));
    for (int r = 1; r < n; r += 2)
        for (int c = 0; c < n - 1; ++c) m[r][c] = '0';
    // Rows 0,2,4... are land, joined by the last column: a single snake.
    CHECK_EQ(num_islands(m), 1);
    int land = 0;
    for (const auto& row : m) land += static_cast<int>(std::count(row.begin(), row.end(), '1'));
    CHECK_EQ(largest_island(m), land);
}

int main() { return dojo::run_all(); }
