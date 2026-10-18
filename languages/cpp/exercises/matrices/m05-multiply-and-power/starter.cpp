#include <iostream>
#include <vector>

using Mat = std::vector<std::vector<long long>>;

// n x n identity matrix.
Mat identity(int n) {
    return {};  // TODO
}

// a (n x k) times b (k x m) -> n x m.
Mat multiply(const Mat& a, const Mat& b) {
    return {};  // TODO
}

// m^exp for a square matrix, using O(log exp) multiplications.
Mat mat_pow(const Mat& m, long long exp) {
    return {};  // TODO
}

// F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2); compute it with mat_pow.
long long fibonacci(int n) {
    return -1;  // TODO
}

#ifndef DOJO_TEST
int main() {
    Mat a = {{1, 2}, {3, 4}};
    Mat p = multiply(a, a);
    for (const auto& row : p) {
        for (long long x : row) std::cout << x << "\t";
        std::cout << "\n";
    }
    for (int n = 0; n <= 10; ++n) std::cout << fibonacci(n) << " ";
    std::cout << "\n";
}
#endif
