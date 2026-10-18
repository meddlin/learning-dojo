#include <cstdlib>
#include <iostream>

struct Point {
    int x;
    int y;
};

struct Rect {
    Point top_left;
    int width;
    int height;
};

void translate(Point& p, int dx, int dy) {
    p.x += dx;
    p.y += dy;
}

Point midpoint(const Point& a, const Point& b) {
    return {(a.x + b.x) / 2, (a.y + b.y) / 2};
}

int manhattan(const Point& a, const Point& b) {
    return std::abs(a.x - b.x) + std::abs(a.y - b.y);
}

bool contains(const Rect& r, const Point& p) {
    return p.x >= r.top_left.x && p.x < r.top_left.x + r.width && p.y >= r.top_left.y &&
           p.y < r.top_left.y + r.height;
}

class Counter {
public:
    void add(int amount) { total_ += amount; }
    int value() const { return total_; }

private:
    int total_ = 0;
};

#ifndef DOJO_TEST
int main() {
    Point p{1, 2};
    translate(p, 10, 10);
    std::cout << p.x << ", " << p.y << "\n";
}
#endif
