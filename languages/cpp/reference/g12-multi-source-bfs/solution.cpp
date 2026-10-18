#include <algorithm>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>

using Matrix = std::vector<std::vector<int>>;

static const int DR[4] = {-1, 0, 1, 0};
static const int DC[4] = {0, 1, 0, -1};

int minutes_to_rot(Matrix grid) {
    int rows = static_cast<int>(grid.size());
    std::queue<std::pair<int, int>> q;
    int fresh = 0;
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < static_cast<int>(grid[r].size()); ++c) {
            if (grid[r][c] == 2) q.push({r, c});
            else if (grid[r][c] == 1) ++fresh;
        }
    }
    int minutes = 0;
    while (!q.empty() && fresh > 0) {
        ++minutes;
        for (std::size_t i = q.size(); i > 0; --i) {
            auto [r, c] = q.front();
            q.pop();
            for (int k = 0; k < 4; ++k) {
                int nr = r + DR[k], nc = c + DC[k];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= static_cast<int>(grid[nr].size())) continue;
                if (grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                --fresh;
                q.push({nr, nc});
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}

Matrix distance_to_nearest_zero(const Matrix& mat) {
    int rows = static_cast<int>(mat.size());
    Matrix dist(rows);
    std::queue<std::pair<int, int>> q;
    for (int r = 0; r < rows; ++r) {
        dist[r].assign(mat[r].size(), -1);
        for (int c = 0; c < static_cast<int>(mat[r].size()); ++c) {
            if (mat[r][c] == 0) {
                dist[r][c] = 0;
                q.push({r, c});
            }
        }
    }
    while (!q.empty()) {
        auto [r, c] = q.front();
        q.pop();
        for (int k = 0; k < 4; ++k) {
            int nr = r + DR[k], nc = c + DC[k];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= static_cast<int>(mat[nr].size())) continue;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
    return dist;
}

#ifndef DOJO_TEST
int main() {
    std::cout << minutes_to_rot({{2, 1, 1}, {1, 1, 0}, {0, 1, 1}}) << "\n";
    Matrix d = distance_to_nearest_zero({{0, 0, 0}, {0, 1, 0}, {1, 1, 1}});
    for (auto& row : d) {
        for (int x : row) std::cout << x << " ";
        std::cout << "\n";
    }
}
#endif
