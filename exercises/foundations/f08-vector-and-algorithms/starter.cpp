#include <algorithm>
#include <iostream>
#include <limits>
#include <numeric>
#include <string>
#include <vector>

// The square of each EVEN number in v, in the original order.
std::vector<int> evens_squared(const std::vector<int>& v) {
    return {};  // TODO
}

// The largest value in v, or std::numeric_limits<int>::min() if v is empty.
int max_value(const std::vector<int>& v) {
    return 0;  // TODO
}

// Shortest first. Words with the same length keep their original relative order.
std::vector<std::string> sort_by_length(std::vector<std::string> words) {
    return words;  // TODO
}

// Remove every element equal to target from v, in place. Keep the order of the others.
void remove_value(std::vector<int>& v, int target) {
    // TODO
}

// The mean of the values, or 0.0 for an empty vector. Must not overflow.
double average(const std::vector<int>& v) {
    return -1.0;  // TODO
}

#ifndef DOJO_TEST
int main() {
    std::vector<int> v{1, 2, 3, 4};
    for (int x : evens_squared(v)) std::cout << x << " ";
    std::cout << "\n";
}
#endif
