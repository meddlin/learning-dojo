#include <iostream>
#include <utility>

// Sum of the ints in the half-open range [begin, end). An empty range sums to 0.
int sum_range(const int* begin, const int* end) {
    return 0;  // TODO
}

// Reverse the n ints starting at a, in place. n may be 0 or 1.
void reverse_in_place(int* a, int n) {
    // TODO
}

// Rearrange [begin, end) so every even number comes before every odd number.
// Return a pointer to the first odd number, or end if there are none.
int* partition_evens(int* begin, int* end) {
    return begin;  // TODO
}

#ifndef DOJO_TEST
int main() {
    int a[] = {1, 2, 3, 4, 5};
    std::cout << sum_range(a, a + 5) << "\n";
}
#endif
