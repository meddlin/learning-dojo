#include <iostream>
#include <stack>
#include <vector>

using Graph = std::vector<std::vector<int>>;

std::vector<int> dfs_order_iterative(const Graph& g, int start) {
    std::vector<bool> visited(g.size(), false);
    std::vector<int> order;
    std::stack<int> todo;
    todo.push(start);
    while (!todo.empty()) {
        int u = todo.top();
        todo.pop();
        if (visited[u]) continue;
        visited[u] = true;
        order.push_back(u);
        for (auto it = g[u].rbegin(); it != g[u].rend(); ++it) {
            if (!visited[*it]) todo.push(*it);
        }
    }
    return order;
}

#ifndef DOJO_TEST
int main() {
    Graph g = {{1, 2}, {0, 3, 4}, {0, 5}, {1}, {1}, {2}};
    for (int v : dfs_order_iterative(g, 0)) std::cout << v << " ";
    std::cout << "\n";
}
#endif
