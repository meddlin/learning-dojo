#include <iostream>
#include <vector>

class Matrix {
public:
    Matrix(int rows, int cols, double fill = 0.0) {
        // TODO
    }

    int rows() const { return 0; }  // TODO
    int cols() const { return 0; }  // TODO

    double& operator()(int r, int c) {
        static double dummy = 0.0;  // TODO: replace with a reference into your storage
        return dummy;
    }
    const double& operator()(int r, int c) const {
        static double dummy = 0.0;  // TODO
        return dummy;
    }

    const double* data() const { return nullptr; }  // TODO

    Matrix transposed() const {
        return Matrix(0, 0);  // TODO
    }

    static Matrix identity(int n) {
        return Matrix(0, 0);  // TODO
    }

    bool operator==(const Matrix& other) const {
        return false;  // TODO
    }

private:
    // TODO: rows_, cols_, data_
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
