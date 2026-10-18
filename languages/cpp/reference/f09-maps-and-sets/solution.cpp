#include <iostream>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>

std::unordered_map<std::string, int> word_count(const std::vector<std::string>& words) {
    std::unordered_map<std::string, int> counts;
    for (const auto& w : words) ++counts[w];
    return counts;
}

std::optional<int> first_duplicate(const std::vector<int>& v) {
    std::unordered_set<int> seen;
    for (int x : v) {
        if (!seen.insert(x).second) return x;
    }
    return std::nullopt;
}

std::vector<int> two_sum(const std::vector<int>& v, int target) {
    std::unordered_map<int, int> index_of;
    for (int j = 0; j < static_cast<int>(v.size()); ++j) {
        auto it = index_of.find(target - v[j]);
        if (it != index_of.end()) return {it->second, j};
        index_of[v[j]] = j;
    }
    return {};
}

bool is_anagram(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    std::unordered_map<char, int> counts;
    for (char c : a) ++counts[c];
    for (char c : b) {
        if (--counts[c] < 0) return false;
    }
    return true;
}

#ifndef DOJO_TEST
int main() {
    auto counts = word_count({"to", "be", "or", "not", "to", "be"});
    std::cout << "to appears " << counts["to"] << " times\n";
}
#endif
