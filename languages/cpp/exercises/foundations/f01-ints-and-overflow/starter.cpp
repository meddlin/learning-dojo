#include <climits>
#include <cstdint>
#include <iostream>

// True if a + b would overflow an int.
// Decide *before* adding: the addition itself is what is undefined.
bool add_overflows(int a, int b) {
    return false;  // TODO
}

// Sum of the decimal digits of n, ignoring the sign. digit_sum(-482) == 14.
// Careful with INT_MIN: -INT_MIN does not fit in an int.
int digit_sum(int n) {
    return 0;  // TODO
}

// Rotate the bits of x left by k positions. Bits that fall off the left end come
// back in on the right. k can be any value, including 0 and numbers above 31.
std::uint32_t rotate_left(std::uint32_t x, unsigned k) {
    return 0;  // TODO
}

#ifndef DOJO_TEST
int main() {
    // Scratch area: press Run to try things out here.
    std::cout << "INT_MAX is " << INT_MAX << "\n";
}
#endif
