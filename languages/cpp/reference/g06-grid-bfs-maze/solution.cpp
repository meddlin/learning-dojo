#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

using Grid = std::vector<std::string>;
using Cell = std::pair<int, int>;

std::vector<Cell> neighbors(const Grid& grid, int r, int c) {
    const int dr[4] = {-1, 0, 1, 0};
    const int dc[4] = {0, 1, 0, -1};
    std::vector<Cell> out;
    int rows = static_cast<int>(grid.size());
    for (int k = 0; k < 4; ++k) {
        int nr = r + dr[k], nc = c + dc[k];
        if (nr < 0 || nr >= rows) continue;
        if (nc < 0 || nc >= static_cast<int>(grid[nr].size())) continue;
        if (grid[nr][nc] == '#') continue;
        out.push_back({nr, nc});
    }
    return out;
}

int maze_steps(const Grid& grid) {
    int rows = static_cast<int>(grid.size());
    Cell s{-1, -1}, e{-1, -1};
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < static_cast<int>(grid[r].size()); ++c) {
            if (grid[r][c] == 'S') s = {r, c};
            if (grid[r][c] == 'E') e = {r, c};
        }
    }
    if (s.first < 0 || e.first < 0) return -1;
    std::vector<std::vector<int>> dist(rows);
    for (int r = 0; r < rows; ++r) dist[r].assign(grid[r].size(), -1);
    std::queue<Cell> q;
    dist[s.first][s.second] = 0;
    q.push(s);
    while (!q.empty()) {
        Cell cur = q.front();
        q.pop();
        if (cur == e) return dist[cur.first][cur.second];
        for (Cell nb : neighbors(grid, cur.first, cur.second)) {
            if (dist[nb.first][nb.second] == -1) {
                dist[nb.first][nb.second] = dist[cur.first][cur.second] + 1;
                q.push(nb);
            }
        }
    }
    return -1;
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
