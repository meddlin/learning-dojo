# std::vector and the algorithms library

## Concept

`std::vector<T>` is the workhorse container: a resizable array that owns its heap memory (it is the `IntStack` you just wrote, done properly for any type). It frees itself, copies deeply, and tracks its own size.

```cpp
std::vector<int> v = {3, 1, 2};
v.push_back(9);
for (int x : v) { /* read each element */ }
for (const auto& s : words) { /* no copies for big elements */ }
v.size();     // std::size_t: unsigned! comparing it with a negative int is a classic bug
```

`v.begin()` and `v.end()` are **iterators**: pointer-like objects over the half-open range you met earlier. The `<algorithm>` and `<numeric>` headers work on iterator ranges: `std::sort`, `std::find`, `std::max_element`, `std::accumulate`, `std::remove` and many more. Algorithms that need a custom rule take a **lambda**, an inline function:

```cpp
std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });   // descending
```

Two things worth knowing:

- `std::remove` does **not** shrink the container: it moves the survivors to the front and returns the new logical end. You follow it with `erase` (the *erase-remove idiom*).
- `std::accumulate(first, last, init)` sums using the *type of `init`*. `accumulate(v.begin(), v.end(), 0)` sums in `int` even if `v` holds `long long`s or you wanted a double.

## Your task

Implement in `solution.cpp`:

1. `std::vector<int> evens_squared(const std::vector<int>& v)`: the square of each even number, in the original order.
2. `int max_value(const std::vector<int>& v)`: the largest value, or `std::numeric_limits<int>::min()` if `v` is empty.
3. `std::vector<std::string> sort_by_length(std::vector<std::string> words)`: shortest first; words of equal length keep their original relative order.
4. `void remove_value(std::vector<int>& v, int target)`: remove every element equal to `target`, in place.
5. `double average(const std::vector<int>& v)`: the mean, or `0.0` for an empty vector. It must not overflow on large values.
