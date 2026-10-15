#include <iostream>
#include <utility>

int sum_range(const int* begin, const int* end) {
    int total = 0;
    for (const int* p = begin; p != end; ++p) total += *p;
    return total;
}

void reverse_in_place(int* a, int n) {
    int* left = a;
    int* right = a + n;
    while (left < right) {
        --right;
        std::swap(*left, *right);
        ++left;
    }
}

int* partition_evens(int* begin, int* end) {
    int* left = begin;
    int* right = end;
    while (left < right) {
        if (*left % 2 == 0) {
            ++left;
        } else {
            --right;
            std::swap(*left, *right);
        }
    }
    return left;
}

#ifndef DOJO_TEST
int main() {
    int a[] = {1, 2, 3, 4, 5};
    std::cout << sum_range(a, a + 5) << "\n";
}
#endif
