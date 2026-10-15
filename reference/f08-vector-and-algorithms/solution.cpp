#include <algorithm>
#include <iostream>
#include <limits>
#include <numeric>
#include <string>
#include <vector>

std::vector<int> evens_squared(const std::vector<int>& v) {
    std::vector<int> out;
    for (int x : v) {
        if (x % 2 == 0) out.push_back(x * x);
    }
    return out;
}

int max_value(const std::vector<int>& v) {
    if (v.empty()) return std::numeric_limits<int>::min();
    return *std::max_element(v.begin(), v.end());
}

std::vector<std::string> sort_by_length(std::vector<std::string> words) {
    std::stable_sort(words.begin(), words.end(),
                     [](const std::string& a, const std::string& b) { return a.size() < b.size(); });
    return words;
}

void remove_value(std::vector<int>& v, int target) {
    v.erase(std::remove(v.begin(), v.end(), target), v.end());
}

double average(const std::vector<int>& v) {
    if (v.empty()) return 0.0;
    double sum = std::accumulate(v.begin(), v.end(), 0.0);
    return sum / static_cast<double>(v.size());
}

#ifndef DOJO_TEST
int main() {
    std::vector<int> v{1, 2, 3, 4};
    for (int x : evens_squared(v)) std::cout << x << " ";
    std::cout << "\n";
}
#endif
