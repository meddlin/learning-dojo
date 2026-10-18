#include "dojo.h"
#include "solution.cpp"

TEST(shape_and_fill) {
    Matrix m(2, 3, 4.5);
    CHECK_EQ(m.rows(), 2);
    CHECK_EQ(m.cols(), 3);
    for (int r = 0; r < 2; ++r)
        for (int c = 0; c < 3; ++c) CHECK_EQ(m(r, c), 4.5);
}

TEST(default_fill_is_zero) {
    Matrix m(2, 2);
    CHECK_EQ(m(0, 0), 0.0);
    CHECK_EQ(m(1, 1), 0.0);
}

TEST(cells_can_be_assigned_independently) {
    Matrix m(3, 3);
    m(0, 2) = 1;
    m(2, 0) = 2;
    m(1, 1) = 3;
    CHECK_EQ(m(0, 2), 1.0);
    CHECK_EQ(m(2, 0), 2.0);
    CHECK_EQ(m(1, 1), 3.0);
    CHECK_EQ(m(0, 0), 0.0);
    CHECK_EQ(m(2, 2), 0.0);
}

TEST(storage_is_row_major) {
    Matrix m(2, 3);
    double v = 1;
    for (int r = 0; r < 2; ++r)
        for (int c = 0; c < 3; ++c) m(r, c) = v++;
    const double* p = m.data();
    CHECK(p != nullptr);
    if (p) {
        for (int i = 0; i < 6; ++i) CHECK_EQ(p[i], static_cast<double>(i + 1));
    }
}

TEST(const_matrices_can_be_read) {
    Matrix m(2, 2, 1.0);
    m(1, 0) = 8;
    const Matrix& cm = m;
    CHECK_EQ(cm(1, 0), 8.0);
    CHECK_EQ(cm(0, 1), 1.0);
}

TEST(copies_are_independent) {
    Matrix a(2, 2, 1.0);
    Matrix b = a;
    b(0, 0) = 99;
    CHECK_EQ(a(0, 0), 1.0);
    CHECK_EQ(b(0, 0), 99.0);
}

TEST(transposed_swaps_the_shape_and_cells) {
    Matrix m(2, 3);
    double v = 1;
    for (int r = 0; r < 2; ++r)
        for (int c = 0; c < 3; ++c) m(r, c) = v++;
    Matrix t = m.transposed();
    CHECK_EQ(t.rows(), 3);
    CHECK_EQ(t.cols(), 2);
    CHECK_EQ(t(0, 0), 1.0);
    CHECK_EQ(t(0, 1), 4.0);
    CHECK_EQ(t(1, 0), 2.0);
    CHECK_EQ(t(2, 1), 6.0);
}

TEST(transposed_does_not_change_the_original) {
    Matrix m(1, 2);
    m(0, 0) = 1;
    m(0, 1) = 2;
    Matrix t = m.transposed();
    (void)t;
    CHECK_EQ(m.rows(), 1);
    CHECK_EQ(m.cols(), 2);
    CHECK_EQ(m(0, 1), 2.0);
}

TEST(identity_matrix) {
    Matrix id = Matrix::identity(3);
    CHECK_EQ(id.rows(), 3);
    CHECK_EQ(id.cols(), 3);
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c) CHECK_EQ(id(r, c), r == c ? 1.0 : 0.0);
}

TEST(equality) {
    Matrix a(2, 2, 3.0), b(2, 2, 3.0), c(2, 2, 4.0), d(2, 3, 3.0), e(3, 2, 3.0);
    CHECK(a == b);
    CHECK_FALSE(a == c);
    CHECK_FALSE(a == d);
    CHECK_FALSE(d == e);
    b(1, 1) = 0;
    CHECK_FALSE(a == b);
}

TEST(a_transposed_identity_is_the_identity) {
    CHECK(Matrix::identity(4).transposed() == Matrix::identity(4));
}

TEST(a_large_matrix_is_one_allocation_sized_correctly) {
    Matrix big(300, 200, 1.0);
    big(299, 199) = 7;
    CHECK_EQ(big(299, 199), 7.0);
    CHECK_EQ(big.data()[299 * 200 + 199], 7.0);
}

int main() { return dojo::run_all(); }
