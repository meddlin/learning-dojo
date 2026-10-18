# Matrix multiplication and fast powers

## Concept

The product of an `n x k` matrix **A** and a `k x m` matrix **B** is the `n x m` matrix **C** with

```
C[i][j] = A[i][0]*B[0][j] + A[i][1]*B[1][j] + ... + A[i][k-1]*B[k-1][j]
```

(row `i` of A dotted with column `j` of B). The inner dimensions (`k`) must agree. Multiplication is **associative** but **not commutative**: `A*B` and `B*A` are usually different. Remember that, it is the key fact behind transform ordering in the next exercises.

The `n x n` **identity** matrix `I` (ones on the diagonal) is the neutral element: `A * I = I * A = A`.

Because multiplication is associative you can compute `M^n` with **exponentiation by squaring**: `M^13 = M^8 * M^4 * M^1` (13 is binary 1101). Square the base each round, multiply it into the result when the current bit of the exponent is set. That takes about `log2(n)` multiplications.

A beautiful application: the Fibonacci numbers. Since

```
| 1 1 |   | F(n)   |     | F(n+1) |
| 1 0 | * | F(n-1) |  =  | F(n)   |
```

raising `Q = {{1,1},{1,0}}` to the `n`-th power yields `F(n)` in O(log n) steps.

## Your task

Using `Mat = std::vector<std::vector<long long>>`, implement in `solution.cpp`:

1. `Mat identity(int n)`
2. `Mat multiply(const Mat& a, const Mat& b)`: you may assume `a`'s column count equals `b`'s row count and that neither is empty.
3. `Mat mat_pow(const Mat& m, long long exp)`: `m` is square, `exp >= 0`. `mat_pow(m, 0)` is the identity. Must use O(log exp) multiplications (tests use exponents around 10^15).
4. `long long fibonacci(int n)` using `mat_pow`, valid for `0 <= n <= 90`.
