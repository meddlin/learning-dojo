#include "dojo.h"
#include "solution.cpp"

using Cells = std::vector<std::pair<int, int>>;

TEST(neighbors_in_the_middle_follow_the_order) {
    Grid g = {"...", "...", "..."};
    CHECK_EQ(neighbors(g, 1, 1), (Cells{{0, 1}, {1, 2}, {2, 1}, {1, 0}}));
}

TEST(neighbors_stay_inside_the_grid) {
    Grid g = {"...", "...", "..."};
    CHECK_EQ(neighbors(g, 0, 0), (Cells{{0, 1}, {1, 0}}));
    CHECK_EQ(neighbors(g, 2, 2), (Cells{{1, 2}, {2, 1}}));
    CHECK_EQ(neighbors(g, 0, 2), (Cells{{1, 2}, {0, 1}}));
}

TEST(neighbors_skip_walls) {
    Grid g = {".#.", "#.#", ".#."};
    CHECK_EQ(neighbors(g, 1, 1), Cells{});
    Grid h = {"S#E", "...", "###"};
    CHECK_EQ(neighbors(h, 1, 1), (Cells{{1, 2}, {1, 0}}));
}

TEST(neighbors_treat_S_and_E_as_floor) {
    Grid g = {"SE"};
    CHECK_EQ(neighbors(g, 0, 0), (Cells{{0, 1}}));
    CHECK_EQ(neighbors(g, 0, 1), (Cells{{0, 0}}));
}

TEST(adjacent_start_and_exit) {
    CHECK_EQ(maze_steps({"SE"}), 1);
}

TEST(open_room_is_manhattan_distance) {
    Grid g = {
        "S....",
        ".....",
        "....E",
    };
    CHECK_EQ(maze_steps(g), 6);
}

TEST(walls_force_a_detour) {
    Grid g = {
        "S.#..",
        ".##.E",
        "....#",
    };
    // Down twice, right three times, then up and right: 7 moves.
    CHECK_EQ(maze_steps(g), 7);
}

TEST(a_classic_maze) {
    Grid g = {
        "S.#.....",
        ".##.###.",
        "....#...",
        ".####.#.",
        "......#E",
    };
    CHECK_EQ(maze_steps(g), 15);
}

TEST(no_route_returns_minus_one) {
    Grid g = {
        "S#E",
        "##.",
        "...",
    };
    CHECK_EQ(maze_steps(g), -1);
    Grid boxed = {"S#", "#E"};
    CHECK_EQ(maze_steps(boxed), -1);
}

TEST(missing_start_or_exit_returns_minus_one) {
    CHECK_EQ(maze_steps({"...", "..E"}), -1);
    CHECK_EQ(maze_steps({"S..", "..."}), -1);
    CHECK_EQ(maze_steps({}), -1);
}

TEST(a_long_snake_is_handled_without_overflowing_the_stack) {
    // A serpentine corridor over 60 x 60 cells.
    const int n = 60;
    Grid g(n, std::string(n, '.'));
    for (int r = 1; r < n; r += 2) {
        for (int c = 0; c < n; ++c) g[r][c] = '#';
        if ((r / 2) % 2 == 0) g[r][n - 1] = '.'; else g[r][0] = '.';
    }
    g[0][0] = 'S';
    g[n - 1][(((n - 1) / 2) % 2 == 0) ? n - 1 : 0] = 'E';
    int steps = maze_steps(g);
    CHECK(steps > 1000);
}

int main() { return dojo::run_all(); }
