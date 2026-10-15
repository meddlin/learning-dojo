#include "dojo.h"
#include "solution.cpp"

#define CHECK_PT(p, X, Y)                 \
    do {                                  \
        CHECK_NEAR((p).x, (X), 1e-9);     \
        CHECK_NEAR((p).y, (Y), 1e-9);     \
    } while (0)

TEST(degrees_to_radians) {
    CHECK_NEAR(deg_to_rad(0), 0.0, 1e-12);
    CHECK_NEAR(deg_to_rad(180), PI, 1e-12);
    CHECK_NEAR(deg_to_rad(90), PI / 2, 1e-12);
    CHECK_NEAR(deg_to_rad(-45), -PI / 4, 1e-12);
}

TEST(translate_moves_a_point) {
    Vec2 p = translate(Vec2{1, 2}, 3, -5);
    CHECK_PT(p, 4.0, -3.0);
}

TEST(scale_stretches_about_the_origin) {
    Vec2 p = scale(Vec2{2, 3}, 2, 0.5);
    CHECK_PT(p, 4.0, 1.5);
    Vec2 flipped = scale(Vec2{2, 3}, -1, 1);
    CHECK_PT(flipped, -2.0, 3.0);
}

TEST(rotate_quarter_turns) {
    Vec2 a = rotate(Vec2{1, 0}, 90);
    CHECK_PT(a, 0.0, 1.0);
    Vec2 b = rotate(Vec2{1, 0}, 180);
    CHECK_PT(b, -1.0, 0.0);
    Vec2 c = rotate(Vec2{1, 0}, 270);
    CHECK_PT(c, 0.0, -1.0);
    Vec2 d = rotate(Vec2{0, 1}, 90);
    CHECK_PT(d, -1.0, 0.0);
}

TEST(rotate_by_zero_and_full_turn) {
    Vec2 a = rotate(Vec2{3, -4}, 0);
    CHECK_PT(a, 3.0, -4.0);
    Vec2 b = rotate(Vec2{3, -4}, 360);
    CHECK_PT(b, 3.0, -4.0);
}

TEST(rotate_by_45_degrees) {
    double h = std::sqrt(2.0) / 2.0;
    Vec2 p = rotate(Vec2{1, 0}, 45);
    CHECK_PT(p, h, h);
    Vec2 q = rotate(Vec2{1, 1}, 45);
    CHECK_PT(q, 0.0, std::sqrt(2.0));
}

TEST(rotation_preserves_distance_from_the_origin) {
    Vec2 v{3, 4};
    for (double deg = -170; deg <= 170; deg += 17) {
        Vec2 r = rotate(v, deg);
        INFO("angle " + std::to_string(deg));
        CHECK_NEAR(std::hypot(r.x, r.y), 5.0, 1e-9);
    }
}

TEST(rotating_back_undoes_a_rotation) {
    Vec2 v{2.5, -1.25};
    Vec2 back = rotate(rotate(v, 37), -37);
    CHECK_PT(back, 2.5, -1.25);
}

TEST(rotate_about_a_pivot) {
    Vec2 p = rotate_about(Vec2{2, 1}, 90, Vec2{1, 1});
    CHECK_PT(p, 1.0, 2.0);
    Vec2 q = rotate_about(Vec2{5, 5}, 180, Vec2{3, 3});
    CHECK_PT(q, 1.0, 1.0);
}

TEST(the_pivot_itself_does_not_move) {
    Vec2 p = rotate_about(Vec2{4, -2}, 123, Vec2{4, -2});
    CHECK_PT(p, 4.0, -2.0);
}

TEST(pivot_at_the_origin_matches_plain_rotate) {
    Vec2 a = rotate_about(Vec2{1, 2}, 30, Vec2{0, 0});
    Vec2 b = rotate(Vec2{1, 2}, 30);
    CHECK_PT(a, b.x, b.y);
}

int main() { return dojo::run_all(); }
