#include <cmath>
#include <iostream>

struct Vec2 {
    double x;
    double y;
};

const double PI = std::acos(-1.0);

double deg_to_rad(double deg) { return deg * PI / 180.0; }

Vec2 translate(Vec2 v, double dx, double dy) { return {v.x + dx, v.y + dy}; }

Vec2 scale(Vec2 v, double sx, double sy) { return {v.x * sx, v.y * sy}; }

Vec2 rotate(Vec2 v, double deg) {
    double a = deg_to_rad(deg);
    double c = std::cos(a), s = std::sin(a);
    return {v.x * c - v.y * s, v.x * s + v.y * c};
}

Vec2 rotate_about(Vec2 v, double deg, Vec2 pivot) {
    Vec2 p = translate(v, -pivot.x, -pivot.y);
    p = rotate(p, deg);
    return translate(p, pivot.x, pivot.y);
}

#ifndef DOJO_TEST
int main() {
    Vec2 p{1, 0};
    Vec2 q = rotate(p, 90);
    std::cout << "(" << q.x << ", " << q.y << ")\n";
}
#endif
