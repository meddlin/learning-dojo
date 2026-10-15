#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <utility>
#include <vector>

// The k smallest values of v in ascending order (0 <= k <= v.size()).
// Practise the heap: keep only the k smallest seen so far.
std::vector<int> k_smallest(const std::vector<int>& v, int k) {
    return {};  // TODO
}

// Merge individually sorted lists into one sorted list with a min-heap that holds
// one candidate per list.
std::vector<int> merge_sorted_lists(const std::vector<std::vector<int>>& lists) {
    return {};  // TODO
}

// Sort (x, y) points by squared distance from the origin, nearest first.
// Ties: smaller x first, then smaller y.
std::vector<std::pair<int, int>> sort_by_distance(std::vector<std::pair<int, int>> points) {
    return points;  // TODO
}

#ifndef DOJO_TEST
int main() {
    for (int x : k_smallest({5, 1, 4, 2, 3}, 3)) std::cout << x << " ";
    std::cout << "\n";
}
#endif
