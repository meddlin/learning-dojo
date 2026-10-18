#include <cmath>
#include <iostream>

struct Vec2 {
    double x;
    double y;
};

const double PI = std::acos(-1.0);

double deg_to_rad(double deg) {
    return 0.0;  // TODO
}

Vec2 translate(Vec2 v, double dx, double dy) {
    return {0.0, 0.0};  // TODO
}

// About the origin.
Vec2 scale(Vec2 v, double sx, double sy) {
    return {0.0, 0.0};  // TODO
}

// Counter-clockwise about the origin, angle in degrees.
Vec2 rotate(Vec2 v, double deg) {
    return {0.0, 0.0};  // TODO
}

// Counter-clockwise about `pivot`.
Vec2 rotate_about(Vec2 v, double deg, Vec2 pivot) {
    return {0.0, 0.0};  // TODO
}

#ifndef DOJO_TEST
int main() {
    Vec2 p{1, 0};
    Vec2 q = rotate(p, 90);
    std::cout << "(" << q.x << ", " << q.y << ")\n";
}
#endif
