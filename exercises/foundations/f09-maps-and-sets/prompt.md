# Hash maps and sets

## Concept

`std::unordered_map<K, V>` is a hash table: look-up, insert and erase take O(1) time on average. `std::unordered_set<T>` is the same thing with keys only. Use them whenever you catch yourself writing a nested loop just to ask "have I seen this before?".

```cpp
std::unordered_map<std::string, int> ages;
ages["ada"] = 36;               // insert or overwrite
ages.count("bob");              // 0 or 1: is the key present?
auto it = ages.find("ada");     // iterator, or ages.end() if absent
if (it != ages.end()) std::cout << it->second;   // ->first is the key, ->second the value
```

Gotchas:

- `m[key]` on a missing key **inserts** a default-constructed value. That is handy for counting (`++m[k]`) and surprising if you only meant to look.
- Iteration order is unspecified. Never depend on it.
- `set.insert(x)` returns a `std::pair<iterator, bool>`; the bool says whether the insertion happened (the element was new).
- `std::optional<T>` (from `<optional>`) holds either a `T` or nothing (`std::nullopt`). It is the honest way to say "there might be no answer". Test it with `if (opt)` or `opt.has_value()` and read it with `*opt`.

If you need sorted keys use `std::map` / `std::set`, which are balanced trees with O(log n) operations.

## Your task

Implement in `solution.cpp`:

1. `std::unordered_map<std::string, int> word_count(const std::vector<std::string>& words)`: how many times each word occurs.
2. `std::optional<int> first_duplicate(const std::vector<int>& v)`: scanning left to right, the first value that has already appeared earlier. For `{3, 1, 4, 1, 5, 3}` that is `1`. Return `std::nullopt` if all values are distinct.
3. `std::vector<int> two_sum(const std::vector<int>& v, int target)`: indices `{i, j}` with `i < j` and `v[i] + v[j] == target`, or `{}` if there are none. Do it in one pass, O(n). (The tests only use inputs with a single answer.)
4. `bool is_anagram(const std::string& a, const std::string& b)`: true if `a` and `b` have exactly the same characters with the same counts. Case-sensitive.
