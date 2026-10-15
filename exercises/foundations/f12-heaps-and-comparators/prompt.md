# Heaps, pairs and comparators

## Concept

A **priority queue** hands you the best element next. `std::priority_queue<T>` is a **max-heap**: `top()` is the *largest* element; `push` and `pop` are O(log n).

For a **min-heap** (smallest first) name the container and comparator explicitly:

```cpp
std::priority_queue<int, std::vector<int>, std::greater<int>> min_heap;
min_heap.push(5); min_heap.push(1);
min_heap.top();   // 1
```

`std::pair` and `std::tuple` compare **lexicographically**: first element, then the second to break ties, and so on. That makes `(cost, node)` pairs ideal for a min-heap ordered by cost, which is exactly what Dijkstra's algorithm needs later.

```cpp
using Item = std::pair<int, int>;                 // (cost, node)
std::priority_queue<Item, std::vector<Item>, std::greater<Item>> pq;
pq.push({7, 3}); pq.push({2, 9});
auto [cost, node] = pq.top();                      // structured binding: cost = 2, node = 9
```

To sort in a custom order, give `std::sort` a **comparator**: a function returning true when its first argument should come *before* the second. It must be a strict weak ordering (never return true for equal elements).

## Your task

Implement in `solution.cpp`:

1. `std::vector<int> k_smallest(const std::vector<int>& v, int k)`: the `k` smallest values in ascending order (`0 <= k <= v.size()`). Use a heap that never holds more than `k` elements.
2. `std::vector<int> merge_sorted_lists(const std::vector<std::vector<int>>& lists)`: merge several individually sorted lists into one sorted list, using a min-heap holding one candidate per list.
3. `std::vector<std::pair<int, int>> sort_by_distance(std::vector<std::pair<int, int>> points)`: sort `(x, y)` points by distance from the origin, nearest first (compare squared distances). Break ties by `x`, then by `y`.
