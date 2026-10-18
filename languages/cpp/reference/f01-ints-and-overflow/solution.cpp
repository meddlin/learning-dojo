#include <climits>
#include <cstdint>
#include <iostream>

bool add_overflows(int a, int b) {
    if (b > 0) return a > INT_MAX - b;
    return a < INT_MIN - b;
}

int digit_sum(int n) {
    long long v = n;
    if (v < 0) v = -v;
    int sum = 0;
    while (v > 0) {
        sum += static_cast<int>(v % 10);
        v /= 10;
    }
    return sum;
}

std::uint32_t rotate_left(std::uint32_t x, unsigned k) {
    k %= 32;
    if (k == 0) return x;
    return (x << k) | (x >> (32 - k));
}

#ifndef DOJO_TEST
int main() {
    std::cout << rotate_left(0x80000001u, 1) << "\n";
}
#endif
