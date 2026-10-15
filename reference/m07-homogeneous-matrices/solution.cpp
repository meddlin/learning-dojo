#include <cmath>
#include <iostream>

struct Vec2 {
    double x;
    double y;
};

struct Mat3 {
    double m[3][3];
};

const double PI = std::acos(-1.0);

Mat3 identity3() {
    return Mat3{{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}};
}

Mat3 translation(double tx, double ty) {
    return Mat3{{{1, 0, tx}, {0, 1, ty}, {0, 0, 1}}};
}

Mat3 scaling(double sx, double sy) {
    return Mat3{{{sx, 0, 0}, {0, sy, 0}, {0, 0, 1}}};
}

Mat3 rotation(double degrees) {
    double a = degrees * PI / 180.0;
    double c = std::cos(a), s = std::sin(a);
    return Mat3{{{c, -s, 0}, {s, c, 0}, {0, 0, 1}}};
}

Mat3 multiply(const Mat3& a, const Mat3& b) {
    Mat3 r{};
    for (int i = 0; i < 3; ++i)
        for (int j = 0; j < 3; ++j)
            for (int k = 0; k < 3; ++k) r.m[i][j] += a.m[i][k] * b.m[k][j];
    return r;
}

Vec2 apply(const Mat3& m, Vec2 p) {
    return {m.m[0][0] * p.x + m.m[0][1] * p.y + m.m[0][2], m.m[1][0] * p.x + m.m[1][1] * p.y + m.m[1][2]};
}

#ifndef DOJO_TEST
int main() {
    Mat3 m = multiply(translation(5, 0), rotation(90));  // rotate, then translate
    Vec2 p = apply(m, Vec2{1, 0});
    std::cout << "(" << p.x << ", " << p.y << ")\n";
}
#endif
