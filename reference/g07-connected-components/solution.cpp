#include <iostream>
#include <queue>
#include <string>
#include <vector>

using Graph = std::vector<std::vector<int>>;

int count_components(const Graph& g) {
    std::vector<bool> visited(g.size(), false);
    int components = 0;
    for (int s = 0; s < static_cast<int>(g.size()); ++s) {
        if (visited[s]) continue;
        ++components;
        std::queue<int> q;
        visited[s] = true;
        q.push(s);
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            for (int v : g[u]) {
                if (!visited[v]) {
                    visited[v] = true;
                    q.push(v);
                }
            }
        }
    }
    return components;
}

// Flood-fills the island containing (r, c) in `seen`; returns its size.
static int flood(const std::vector<std::string>& grid, std::vector<std::vector<bool>>& seen, int r, int c) {
    const int dr[4] = {-1, 0, 1, 0};
    const int dc[4] = {0, 1, 0, -1};
    int rows = static_cast<int>(grid.size());
    std::queue<std::pair<int, int>> q;
    seen[r][c] = true;
    q.push({r, c});
    int size = 0;
    while (!q.empty()) {
        auto [cr, cc] = q.front();
        q.pop();
        ++size;
        for (int k = 0; k < 4; ++k) {
            int nr = cr + dr[k], nc = cc + dc[k];
            if (nr < 0 || nr >= rows || nc < 0 || nc >= static_cast<int>(grid[nr].size())) continue;
            if (grid[nr][nc] != '1' || seen[nr][nc]) continue;
            seen[nr][nc] = true;
            q.push({nr, nc});
        }
    }
    return size;
}

static void scan(const std::vector<std::string>& grid, int& islands, int& biggest) {
    std::vector<std::vector<bool>> seen(grid.size());
    for (std::size_t r = 0; r < grid.size(); ++r) seen[r].assign(grid[r].size(), false);
    islands = 0;
    biggest = 0;
    for (std::size_t r = 0; r < grid.size(); ++r) {
        for (std::size_t c = 0; c < grid[r].size(); ++c) {
            if (grid[r][c] == '1' && !seen[r][c]) {
                ++islands;
                int size = flood(grid, seen, static_cast<int>(r), static_cast<int>(c));
                if (size > biggest) biggest = size;
            }
        }
    }
}

int num_islands(const std::vector<std::string>& grid) {
    int islands, biggest;
    scan(grid, islands, biggest);
    return islands;
}

int largest_island(const std::vector<std::string>& grid) {
    int islands, biggest;
    scan(grid, islands, biggest);
    return biggest;
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1}, {0}, {3}, {2}, {}};
    std::cout << "components: " << count_components(g) << "\n";
    std::vector<std::string> map = {"11000", "11000", "00100", "00011"};
    std::cout << "islands: " << num_islands(map) << ", largest: " << largest_island(map) << "\n";
}
#endif
