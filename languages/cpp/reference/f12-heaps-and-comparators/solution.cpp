#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

std::vector<int> k_smallest(const std::vector<int>& v, int k) {
    std::priority_queue<int> heap;  // max-heap of the k smallest so far
    for (int x : v) {
        heap.push(x);
        if (static_cast<int>(heap.size()) > k) heap.pop();
    }
    std::vector<int> out;
    while (!heap.empty()) {
        out.push_back(heap.top());
        heap.pop();
    }
    std::reverse(out.begin(), out.end());
    return out;
}

std::vector<int> merge_sorted_lists(const std::vector<std::vector<int>>& lists) {
    using Item = std::tuple<int, int, int>;  // value, list index, position in list
    std::priority_queue<Item, std::vector<Item>, std::greater<Item>> heap;
    for (int i = 0; i < static_cast<int>(lists.size()); ++i) {
        if (!lists[i].empty()) heap.push({lists[i][0], i, 0});
    }
    std::vector<int> out;
    while (!heap.empty()) {
        auto [value, list, pos] = heap.top();
        heap.pop();
        out.push_back(value);
        if (pos + 1 < static_cast<int>(lists[list].size())) heap.push({lists[list][pos + 1], list, pos + 1});
    }
    return out;
}

std::vector<std::pair<int, int>> sort_by_distance(std::vector<std::pair<int, int>> points) {
    auto d2 = [](const std::pair<int, int>& p) { return p.first * p.first + p.second * p.second; };
    std::sort(points.begin(), points.end(), [&](const std::pair<int, int>& a, const std::pair<int, int>& b) {
        return std::make_tuple(d2(a), a.first, a.second) < std::make_tuple(d2(b), b.first, b.second);
    });
    return points;
}

#ifndef DOJO_TEST
int main() {
    for (int x : k_smallest({5, 1, 4, 2, 3}, 3)) std::cout << x << " ";
    std::cout << "\n";
}
#endif
