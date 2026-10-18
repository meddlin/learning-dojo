#include <cstdlib>
#include <iostream>

struct Point {
    int x;
    int y;
};

struct Rect {
    Point top_left;  // y grows downward, like screen coordinates
    int width;
    int height;
};

// Move the caller's point by (dx, dy). Take p by reference so the caller sees the change.
void translate(Point& p, int dx, int dy) {
    // TODO
}

// Integer midpoint of a and b: ((a.x + b.x) / 2, (a.y + b.y) / 2).
Point midpoint(const Point& a, const Point& b) {
    return {0, 0};  // TODO
}

// |a.x - b.x| + |a.y - b.y|
int manhattan(const Point& a, const Point& b) {
    return 0;  // TODO
}

// True if p is inside r. Left and top edges count as inside; right and bottom do not:
// x in [left, left + width) and y in [top, top + height).
bool contains(const Rect& r, const Point& p) {
    return false;  // TODO
}

// A counter with a hidden total. Implement the two member functions.
class Counter {
public:
    void add(int amount) {
        // TODO
    }

    int value() const {
        return 0;  // TODO
    }

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
