#include <iostream>

// Swap the two ints that a and b point to.
void swap_ints(int* a, int* b) {
    // TODO
}

// n >= 1. Write the smallest and largest of the n values through out_min and out_max.
void min_max(const int* values, int n, int* out_min, int* out_max) {
    // TODO
}

// If p is not null and *p is positive, add one to *p and return true.
// Otherwise return false and change nothing.
bool bump_if_positive(int* p) {
    return false;  // TODO
}

// Return a pointer to the first element equal to target, or nullptr if there is none.
// Return an address *inside* the array, not a copy of the value.
int* find_first(int* values, int n, int target) {
    return nullptr;  // TODO
}

#ifndef DOJO_TEST
int main() {
    int a = 1, b = 2;
    swap_ints(&a, &b);
    std::cout << a << " " << b << "\n";
}
#endif
