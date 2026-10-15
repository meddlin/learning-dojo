#include <iostream>
#include <vector>

using Mat = std::vector<std::vector<long long>>;

Mat identity(int n) {
    Mat m(n, std::vector<long long>(n, 0));
    for (int i = 0; i < n; ++i) m[i][i] = 1;
    return m;
}

Mat multiply(const Mat& a, const Mat& b) {
    std::size_t n = a.size(), k = b.size(), m = b[0].size();
    Mat c(n, std::vector<long long>(m, 0));
    for (std::size_t i = 0; i < n; ++i)
        for (std::size_t t = 0; t < k; ++t)
            for (std::size_t j = 0; j < m; ++j) c[i][j] += a[i][t] * b[t][j];
    return c;
}

Mat mat_pow(const Mat& m, long long exp) {
    Mat result = identity(static_cast<int>(m.size()));
    Mat base = m;
    while (exp > 0) {
        if (exp & 1) result = multiply(result, base);
        exp >>= 1;
        if (exp > 0) base = multiply(base, base);
    }
    return result;
}

long long fibonacci(int n) {
    Mat q = {{1, 1}, {1, 0}};
    return mat_pow(q, n)[0][1];
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
