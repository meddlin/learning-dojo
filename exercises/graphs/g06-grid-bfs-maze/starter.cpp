#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

using Grid = std::vector<std::string>;
using Cell = std::pair<int, int>;

// Walkable in-bounds neighbours of (r, c), in the order up, right, down, left.
std::vector<Cell> neighbors(const Grid& grid, int r, int c) {
    return {};  // TODO
}

// Fewest moves from 'S' to 'E', or -1 if impossible.
int maze_steps(const Grid& grid) {
    return -2;  // TODO
}

#ifndef DOJO_TEST
int main() {
    Grid maze = {
        "S.#.....",
        ".##.###.",
        "....#...",
        ".####.#.",
        "......#E",
    };
    std::cout << "steps: " << maze_steps(maze) << "\n";
}
#endif
