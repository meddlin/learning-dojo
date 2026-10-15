#include <iostream>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

// How many times each word occurs.
std::unordered_map<std::string, int> word_count(const std::vector<std::string>& words) {
    return {};  // TODO
}

// Scanning left to right, the first value that has already appeared earlier in v.
// {3, 1, 4, 1, 5, 3} -> 1.  std::nullopt if all values are distinct.
std::optional<int> first_duplicate(const std::vector<int>& v) {
    return std::nullopt;  // TODO
}

// Indices {i, j} with i < j and v[i] + v[j] == target, or {} if none. One pass, O(n).
std::vector<int> two_sum(const std::vector<int>& v, int target) {
    return {};  // TODO
}

// True if a and b contain exactly the same characters with the same counts.
bool is_anagram(const std::string& a, const std::string& b) {
    return false;  // TODO
}

#ifndef DOJO_TEST
int main() {
    auto counts = word_count({"to", "be", "or", "not", "to", "be"});
    std::cout << "to appears " << counts["to"] << " times\n";
}
#endif
