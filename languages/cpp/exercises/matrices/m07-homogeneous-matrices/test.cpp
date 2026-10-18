#include "dojo.h"
#include "solution.cpp"

#define CHECK_PT(p, X, Y)                 \
    do {                                  \
        CHECK_NEAR((p).x, (X), 1e-9);     \
        CHECK_NEAR((p).y, (Y), 1e-9);     \
    } while (0)

static void expect_matrix_near(const Mat3& got, const Mat3& want) {
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c) {
            INFO("cell (" + std::to_string(r) + ", " + std::to_string(c) + ")");
            CHECK_NEAR(got.m[r][c], want.m[r][c], 1e-9);
        }
}

TEST(identity_has_ones_on_the_diagonal_only) {
    Mat3 id = identity3();
    for (int r = 0; r < 3; ++r)
        for (int c = 0; c < 3; ++c) CHECK_EQ(id.m[r][c], r == c ? 1.0 : 0.0);
}

TEST(identity_leaves_points_alone) {
    Vec2 p = apply(identity3(), Vec2{3.5, -2});
    CHECK_PT(p, 3.5, -2.0);
}

TEST(translation_layout_and_effect) {
    Mat3 t = translation(2, 3);
    CHECK_EQ(t.m[0][2], 2.0);
    CHECK_EQ(t.m[1][2], 3.0);
    CHECK_EQ(t.m[2][2], 1.0);
    CHECK_EQ(t.m[0][0], 1.0);
    CHECK_EQ(t.m[1][1], 1.0);
    Vec2 p = apply(t, Vec2{1, 1});
    CHECK_PT(p, 3.0, 4.0);
    Vec2 o = apply(t, Vec2{0, 0});
    CHECK_PT(o, 2.0, 3.0);
}

TEST(scaling_layout_and_effect) {
    Mat3 s = scaling(2, 3);
    CHECK_EQ(s.m[0][0], 2.0);
    CHECK_EQ(s.m[1][1], 3.0);
    CHECK_EQ(s.m[2][2], 1.0);
    Vec2 p = apply(s, Vec2{4, 5});
    CHECK_PT(p, 8.0, 15.0);
}

TEST(rotation_quarter_and_half_turns) {
    Vec2 a = apply(rotation(90), Vec2{1, 0});
    CHECK_PT(a, 0.0, 1.0);
    Vec2 b = apply(rotation(180), Vec2{1, 2});
    CHECK_PT(b, -1.0, -2.0);
    Vec2 c = apply(rotation(-90), Vec2{1, 0});
    CHECK_PT(c, 0.0, -1.0);
}

TEST(rotation_leaves_the_bottom_row_alone) {
    Mat3 r = rotation(33);
    CHECK_EQ(r.m[2][0], 0.0);
    CHECK_EQ(r.m[2][1], 0.0);
    CHECK_EQ(r.m[2][2], 1.0);
}

TEST(multiplying_by_identity_changes_nothing) {
    Mat3 m = multiply(translation(1, 2), rotation(40));
    expect_matrix_near(multiply(m, identity3()), m);
    expect_matrix_near(multiply(identity3(), m), m);
}

TEST(the_right_hand_matrix_acts_first) {
    Vec2 p{1, 1};
    // T * S: scale, then translate -> (1,1) -> (2,2) -> (7,2)
    Vec2 a = apply(multiply(translation(5, 0), scaling(2, 2)), p);
    CHECK_PT(a, 7.0, 2.0);
    // S * T: translate, then scale -> (1,1) -> (6,1) -> (12,2)
    Vec2 b = apply(multiply(scaling(2, 2), translation(5, 0)), p);
    CHECK_PT(b, 12.0, 2.0);
}

TEST(composition_equals_applying_one_after_another) {
    Mat3 t = translation(3, -1), r = rotation(25), s = scaling(2, 0.5);
    Mat3 all = multiply(t, multiply(r, s));
    Vec2 p{1.5, 2.5};
    Vec2 step = apply(t, apply(r, apply(s, p)));
    Vec2 once = apply(all, p);
    CHECK_PT(once, step.x, step.y);
}

TEST(multiplication_is_associative) {
    Mat3 a = rotation(10), b = translation(1, 2), c = scaling(3, 4);
    expect_matrix_near(multiply(multiply(a, b), c), multiply(a, multiply(b, c)));
}

TEST(rotation_followed_by_its_inverse_is_the_identity) {
    expect_matrix_near(multiply(rotation(30), rotation(-30)), identity3());
}

TEST(translation_followed_by_its_inverse_is_the_identity) {
    expect_matrix_near(multiply(translation(4, -7), translation(-4, 7)), identity3());
}

int main() { return dojo::run_all(); }
