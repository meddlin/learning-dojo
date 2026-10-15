#include <iostream>
#include <vector>

class Matrix {
public:
    Matrix(int rows, int cols, double fill = 0.0)
        : rows_(rows), cols_(cols), data_(static_cast<std::size_t>(rows) * cols, fill) {}

    int rows() const { return rows_; }
    int cols() const { return cols_; }

    double& operator()(int r, int c) { return data_[static_cast<std::size_t>(r) * cols_ + c]; }
    const double& operator()(int r, int c) const { return data_[static_cast<std::size_t>(r) * cols_ + c]; }

    const double* data() const { return data_.data(); }

    Matrix transposed() const {
        Matrix t(cols_, rows_);
        for (int r = 0; r < rows_; ++r)
            for (int c = 0; c < cols_; ++c) t(c, r) = (*this)(r, c);
        return t;
    }

    static Matrix identity(int n) {
        Matrix m(n, n);
        for (int i = 0; i < n; ++i) m(i, i) = 1.0;
        return m;
    }

    bool operator==(const Matrix& other) const {
        return rows_ == other.rows_ && cols_ == other.cols_ && data_ == other.data_;
    }

private:
    int rows_;
    int cols_;
    std::vector<double> data_;
};

#ifndef DOJO_TEST
int main() {
    Matrix m(2, 3);
    for (int r = 0; r < m.rows(); ++r)
        for (int c = 0; c < m.cols(); ++c) m(r, c) = r * 10 + c;
    Matrix t = m.transposed();
    for (int r = 0; r < t.rows(); ++r) {
        for (int c = 0; c < t.cols(); ++c) std::cout << t(r, c) << "\t";
        std::cout << "\n";
    }
}
#endif
