#include "dojo.h"
#include "solution.cpp"

TEST(translate_changes_the_callers_point) {
    Point p{1, 2};
    translate(p, 3, 4);
    CHECK_EQ(p.x, 4);
    CHECK_EQ(p.y, 6);
}

TEST(midpoint_of_two_points) {
    const Point a{0, 0};
    const Point b{4, 6};
    Point m = midpoint(a, b);
    CHECK_EQ(m.x, 2);
    CHECK_EQ(m.y, 3);
    CHECK_EQ(a.x, 0);
    CHECK_EQ(b.y, 6);
}

TEST(midpoint_uses_integer_division) {
    Point m = midpoint({1, 1}, {2, 2});
    CHECK_EQ(m.x, 1);
    CHECK_EQ(m.y, 1);
    Point n = midpoint({-4, -4}, {0, 0});
    CHECK_EQ(n.x, -2);
    CHECK_EQ(n.y, -2);
}

TEST(manhattan_distance) {
    CHECK_EQ(manhattan({0, 0}, {3, 4}), 7);
    CHECK_EQ(manhattan({3, 4}, {0, 0}), 7);
    CHECK_EQ(manhattan({-2, 5}, {-2, 5}), 0);
    CHECK_EQ(manhattan({-1, -1}, {1, 1}), 4);
}

TEST(contains_inside_and_outside) {
    Rect r{{10, 20}, 5, 3};
    CHECK(contains(r, {12, 21}));
    CHECK_FALSE(contains(r, {9, 21}));
    CHECK_FALSE(contains(r, {12, 19}));
    CHECK_FALSE(contains(r, {12, 24}));
}

TEST(contains_edges_left_top_in_right_bottom_out) {
    Rect r{{10, 20}, 5, 3};
    CHECK(contains(r, {10, 20}));
    CHECK(contains(r, {14, 22}));
    CHECK_FALSE(contains(r, {15, 21}));
    CHECK_FALSE(contains(r, {12, 23}));
}

TEST(counter_accumulates) {
    Counter c;
    CHECK_EQ(c.value(), 0);
    c.add(5);
    c.add(-2);
    CHECK_EQ(c.value(), 3);
}

TEST(counter_copies_are_independent) {
    Counter a;
    a.add(1);
    Counter b = a;
    b.add(10);
    CHECK_EQ(a.value(), 1);
    CHECK_EQ(b.value(), 11);
}

TEST(counter_works_through_a_const_reference) {
    Counter c;
    c.add(7);
    const Counter& view = c;
    CHECK_EQ(view.value(), 7);
}

int main() { return dojo::run_all(); }
