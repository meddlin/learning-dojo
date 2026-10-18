#include <algorithm>
#include <cmath>
#include <iostream>
#include <limits>
#include <vector>

struct Vec2 {
    double x;
    double y;
};

struct Mat3 {
    double m[3][3];
};

struct Box {
    double min_x, min_y, max_x, max_y;
};

const double PI = std::acos(-1.0);

// ---- Provided building blocks (from the previous exercise) -----------------
Mat3 identity3() { return Mat3{{{1, 0, 0}, {0, 1, 0}, {0, 0, 1}}}; }
Mat3 translation(double tx, double ty) { return Mat3{{{1, 0, tx}, {0, 1, ty}, {0, 0, 1}}}; }
Mat3 scaling(double sx, double sy) { return Mat3{{{sx, 0, 0}, {0, sy, 0}, {0, 0, 1}}}; }
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

// ---- Your work --------------------------------------------------------------

// Counter-clockwise rotation around `pivot`.
Mat3 rotation_about(double degrees, Vec2 pivot) {
    return identity3();  // TODO
}

// Scale around `pivot` (the pivot stays where it is).
Mat3 scaling_about(double sx, double sy, Vec2 pivot) {
    return identity3();  // TODO
}

// Every point transformed by m, same order.
std::vector<Vec2> transform_all(const Mat3& m, const std::vector<Vec2>& pts) {
    return {};  // TODO
}

// One matrix that applies steps[0] first, then steps[1], ... (empty list -> identity).
Mat3 compose(const std::vector<Mat3>& steps) {
    return identity3();  // TODO
}

// Inverse of a matrix built only from rotations and translations.
Mat3 invert_rigid(const Mat3& m) {
    return identity3();  // TODO
}

// Smallest axis-aligned box containing all points; all zeros for an empty list.
Box bounding_box(const std::vector<Vec2>& pts) {
    return {-1, -1, -1, -1};  // TODO
}

#ifndef DOJO_TEST
int main() {
    std::vector<Vec2> square = {{0, 0}, {2, 0}, {2, 2}, {0, 2}};
    Mat3 m = rotation_about(90, Vec2{1, 1});
    for (Vec2 p : transform_all(m, square)) std::cout << "(" << p.x << ", " << p.y << ") ";
    std::cout << "\n";
}
#endif
