#include "dojo.h"
#include "solution.cpp"

TEST(balanced_brackets_yes) {
    CHECK(balanced_brackets(""));
    CHECK(balanced_brackets("()"));
    CHECK(balanced_brackets("([]{})"));
    CHECK(balanced_brackets("a(b)c[d]{e}"));
    CHECK(balanced_brackets("{[()()]}"));
}

TEST(balanced_brackets_no) {
    CHECK_FALSE(balanced_brackets("(]"));
    CHECK_FALSE(balanced_brackets("(("));
    CHECK_FALSE(balanced_brackets("))"));
    CHECK_FALSE(balanced_brackets("([)]"));
    CHECK_FALSE(balanced_brackets("}{"));
}

TEST(evaluate_rpn_simple) {
    CHECK_EQ(evaluate_rpn({"5"}), 5);
    CHECK_EQ(evaluate_rpn({"2", "1", "+", "3", "*"}), 9);
    CHECK_EQ(evaluate_rpn({"4", "13", "5", "/", "+"}), 6);
}

TEST(evaluate_rpn_operand_order_matters) {
    CHECK_EQ(evaluate_rpn({"5", "3", "-"}), 2);
    CHECK_EQ(evaluate_rpn({"8", "2", "/"}), 4);
}

TEST(evaluate_rpn_negatives_and_truncation) {
    CHECK_EQ(evaluate_rpn({"7", "-2", "/"}), -3);
    CHECK_EQ(evaluate_rpn({"-7", "2", "/"}), -3);
    CHECK_EQ(evaluate_rpn({"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}), 22);
}

TEST(last_survivor_known_values) {
    CHECK_EQ(last_survivor(1, 3), 1);
    CHECK_EQ(last_survivor(5, 2), 3);
    CHECK_EQ(last_survivor(6, 2), 5);
    CHECK_EQ(last_survivor(7, 3), 4);
    CHECK_EQ(last_survivor(41, 3), 31);
}

TEST(last_survivor_k_equals_one_removes_in_order) {
    CHECK_EQ(last_survivor(10, 1), 10);
}

int main() { return dojo::run_all(); }
