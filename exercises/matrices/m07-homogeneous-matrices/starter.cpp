#include <cmath>
#include <iostream>

struct Vec2 {
    double x;
    double y;
};

// Row-major: m[row][col].
struct Mat3 {
    double m[3][3];
};

const double PI = std::acos(-1.0);

Mat3 identity3() {
    return Mat3{};  // TODO (this is all zeros right now)
}

Mat3 translation(double tx, double ty) {
    return Mat3{};  // TODO
}

Mat3 scaling(double sx, double sy) {
    return Mat3{};  // TODO
}

// Counter-clockwise, angle in degrees.
Mat3 rotation(double degrees) {
    return Mat3{};  // TODO
}

// The matrix product a * b (so b is applied first when used on a point).
Mat3 multiply(const Mat3& a, const Mat3& b) {
    return Mat3{};  // TODO
}

// Treat p as (x, y, 1) and return the transformed point.
Vec2 apply(const Mat3& m, Vec2 p) {
    return {0.0, 0.0};  // TODO
}

#ifndef DOJO_TEST
int main() {
    Mat3 m = multiply(translation(5, 0), rotation(90));  // rotate, then translate
    Vec2 p = apply(m, Vec2{1, 0});
    std::cout << "(" << p.x << ", " << p.y << ")\n";
}
#endif
