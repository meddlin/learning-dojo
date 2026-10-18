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

Mat3 rotation_about(double degrees, Vec2 pivot) {
    return multiply(translation(pivot.x, pivot.y), multiply(rotation(degrees), translation(-pivot.x, -pivot.y)));
}

Mat3 scaling_about(double sx, double sy, Vec2 pivot) {
    return multiply(translation(pivot.x, pivot.y), multiply(scaling(sx, sy), translation(-pivot.x, -pivot.y)));
}

std::vector<Vec2> transform_all(const Mat3& m, const std::vector<Vec2>& pts) {
    std::vector<Vec2> out;
    out.reserve(pts.size());
    for (Vec2 p : pts) out.push_back(apply(m, p));
    return out;
}

Mat3 compose(const std::vector<Mat3>& steps) {
    Mat3 result = identity3();
    for (const Mat3& s : steps) result = multiply(s, result);
    return result;
}

Mat3 invert_rigid(const Mat3& m) {
    // m = [R | t]; inverse = [R^T | -R^T t]
    Mat3 inv = identity3();
    for (int r = 0; r < 2; ++r)
        for (int c = 0; c < 2; ++c) inv.m[r][c] = m.m[c][r];
    double tx = m.m[0][2], ty = m.m[1][2];
    inv.m[0][2] = -(inv.m[0][0] * tx + inv.m[0][1] * ty);
    inv.m[1][2] = -(inv.m[1][0] * tx + inv.m[1][1] * ty);
    return inv;
}

Box bounding_box(const std::vector<Vec2>& pts) {
    if (pts.empty()) return {0, 0, 0, 0};
    Box b{pts[0].x, pts[0].y, pts[0].x, pts[0].y};
    for (Vec2 p : pts) {
        b.min_x = std::min(b.min_x, p.x);
        b.min_y = std::min(b.min_y, p.y);
        b.max_x = std::max(b.max_x, p.x);
        b.max_y = std::max(b.max_y, p.y);
    }
    return b;
}

#ifndef DOJO_TEST
int main() {
    std::vector<Vec2> square = {{0, 0}, {2, 0}, {2, 2}, {0, 2}};
    Mat3 m = rotation_about(90, Vec2{1, 1});
    for (Vec2 p : transform_all(m, square)) std::cout << "(" << p.x << ", " << p.y << ") ";
    std::cout << "\n";
}
#endif
