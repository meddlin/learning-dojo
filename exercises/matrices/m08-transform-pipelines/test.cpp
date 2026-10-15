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

TEST(rotation_about_a_pivot) {
    Vec2 a = apply(rotation_about(90, Vec2{1, 1}), Vec2{2, 1});
    CHECK_PT(a, 1.0, 2.0);
    Vec2 b = apply(rotation_about(180, Vec2{3, 3}), Vec2{5, 5});
    CHECK_PT(b, 1.0, 1.0);
}

TEST(the_pivot_is_a_fixed_point_of_rotation) {
    Vec2 p = apply(rotation_about(77, Vec2{4, -2}), Vec2{4, -2});
    CHECK_PT(p, 4.0, -2.0);
}

TEST(rotation_about_the_origin_is_plain_rotation) {
    expect_matrix_near(rotation_about(35, Vec2{0, 0}), rotation(35));
}

TEST(scaling_about_a_pivot) {
    Vec2 a = apply(scaling_about(2, 2, Vec2{1, 1}), Vec2{2, 3});
    CHECK_PT(a, 3.0, 5.0);
    Vec2 pivot = apply(scaling_about(5, 0.5, Vec2{-3, 7}), Vec2{-3, 7});
    CHECK_PT(pivot, -3.0, 7.0);
}

TEST(transform_all_keeps_order_and_count) {
    std::vector<Vec2> pts = {{0, 0}, {1, 0}, {1, 1}};
    std::vector<Vec2> out = transform_all(translation(10, 20), pts);
    CHECK_EQ(out.size(), static_cast<std::size_t>(3));
    if (out.size() == 3) {
        CHECK_PT(out[0], 10.0, 20.0);
        CHECK_PT(out[1], 11.0, 20.0);
        CHECK_PT(out[2], 11.0, 21.0);
    }
    CHECK(transform_all(identity3(), {}).empty());
}

TEST(transform_all_does_not_modify_the_input) {
    std::vector<Vec2> pts = {{1, 2}, {3, 4}};
    transform_all(scaling(2, 2), pts);
    CHECK_PT(pts[0], 1.0, 2.0);
    CHECK_PT(pts[1], 3.0, 4.0);
}

TEST(compose_of_nothing_is_identity) {
    expect_matrix_near(compose({}), identity3());
}

TEST(compose_of_one_step) {
    expect_matrix_near(compose({rotation(20)}), rotation(20));
}

TEST(compose_applies_the_first_step_first) {
    // translate by (1,0) first, then scale by 2 -> (0,0) -> (1,0) -> (2,0)
    Vec2 a = apply(compose({translation(1, 0), scaling(2, 2)}), Vec2{0, 0});
    CHECK_PT(a, 2.0, 0.0);
    // scale first, then translate -> (0,0) -> (0,0) -> (1,0)
    Vec2 b = apply(compose({scaling(2, 2), translation(1, 0)}), Vec2{0, 0});
    CHECK_PT(b, 1.0, 0.0);
}

TEST(compose_matches_step_by_step_application) {
    std::vector<Mat3> steps = {scaling(2, 3), rotation(30), translation(-4, 5), rotation(-10)};
    Vec2 p{1.25, -0.75};
    Vec2 manual = p;
    for (const Mat3& s : steps) manual = apply(s, manual);
    Vec2 once = apply(compose(steps), p);
    CHECK_PT(once, manual.x, manual.y);
}

TEST(invert_a_translation) {
    expect_matrix_near(invert_rigid(translation(3, -4)), translation(-3, 4));
}

TEST(invert_a_rotation) {
    expect_matrix_near(invert_rigid(rotation(50)), rotation(-50));
}

TEST(invert_a_rotation_plus_translation) {
    Mat3 m = multiply(translation(3, 4), rotation(30));
    expect_matrix_near(multiply(invert_rigid(m), m), identity3());
    expect_matrix_near(multiply(m, invert_rigid(m)), identity3());
}

TEST(inverse_brings_points_home) {
    Mat3 m = compose({rotation(-70), translation(9, -2), rotation(15)});
    Vec2 p{2.5, 8.0};
    Vec2 back = apply(invert_rigid(m), apply(m, p));
    CHECK_PT(back, 2.5, 8.0);
}

TEST(bounding_box_of_a_few_points) {
    Box b = bounding_box({{1, 5}, {-2, 3}, {4, -1}});
    CHECK_EQ(b.min_x, -2.0);
    CHECK_EQ(b.min_y, -1.0);
    CHECK_EQ(b.max_x, 4.0);
    CHECK_EQ(b.max_y, 5.0);
}

TEST(bounding_box_of_one_point_and_of_negative_points) {
    Box one = bounding_box({{3, 4}});
    CHECK_EQ(one.min_x, 3.0);
    CHECK_EQ(one.max_x, 3.0);
    CHECK_EQ(one.min_y, 4.0);
    CHECK_EQ(one.max_y, 4.0);
    Box neg = bounding_box({{-5, -6}, {-1, -9}});
    CHECK_EQ(neg.max_x, -1.0);
    CHECK_EQ(neg.max_y, -6.0);
    CHECK_EQ(neg.min_x, -5.0);
    CHECK_EQ(neg.min_y, -9.0);
}

TEST(bounding_box_of_nothing_is_zero) {
    Box b = bounding_box({});
    CHECK_EQ(b.min_x, 0.0);
    CHECK_EQ(b.min_y, 0.0);
    CHECK_EQ(b.max_x, 0.0);
    CHECK_EQ(b.max_y, 0.0);
}

TEST(a_square_rotated_45_degrees_about_its_centre) {
    std::vector<Vec2> square = {{0, 0}, {2, 0}, {2, 2}, {0, 2}};
    std::vector<Vec2> r = transform_all(rotation_about(45, Vec2{1, 1}), square);
    Box b = bounding_box(r);
    double half_diag = std::sqrt(2.0);
    CHECK_NEAR(b.min_x, 1.0 - half_diag, 1e-9);
    CHECK_NEAR(b.max_x, 1.0 + half_diag, 1e-9);
    CHECK_NEAR(b.min_y, 1.0 - half_diag, 1e-9);
    CHECK_NEAR(b.max_y, 1.0 + half_diag, 1e-9);
}

int main() { return dojo::run_all(); }
