#include "dojo.h"
#include "solution.cpp"

TEST(word_count_counts_each_word) {
    auto c = word_count({"to", "be", "or", "not", "to", "be", "to"});
    CHECK_EQ(c.size(), 4u);
    CHECK_EQ(c["to"], 3);
    CHECK_EQ(c["be"], 2);
    CHECK_EQ(c["or"], 1);
    CHECK_EQ(c["not"], 1);
}

TEST(word_count_empty_and_missing) {
    CHECK_EQ(word_count({}).size(), 0u);
    auto c = word_count({"a"});
    CHECK_EQ(c.count("zzz"), 0u);
}

TEST(first_duplicate_finds_the_earliest_completion) {
    auto r = first_duplicate({3, 1, 4, 1, 5, 3});
    CHECK(r.has_value());
    if (r) CHECK_EQ(*r, 1);
}

TEST(first_duplicate_simple_cases) {
    auto a = first_duplicate({5, 5});
    CHECK(a.has_value());
    if (a) CHECK_EQ(*a, 5);
    CHECK_FALSE(first_duplicate({1, 2, 3}).has_value());
    CHECK_FALSE(first_duplicate({}).has_value());
}

TEST(first_duplicate_handles_negatives) {
    auto r = first_duplicate({-1, 2, -1});
    CHECK(r.has_value());
    if (r) CHECK_EQ(*r, -1);
}

TEST(two_sum_classic_examples) {
    CHECK_EQ(two_sum({2, 7, 11, 15}, 9), (std::vector<int>{0, 1}));
    CHECK_EQ(two_sum({3, 2, 4}, 6), (std::vector<int>{1, 2}));
    CHECK_EQ(two_sum({3, 3}, 6), (std::vector<int>{0, 1}));
}

TEST(two_sum_negatives_and_none) {
    CHECK_EQ(two_sum({-3, 4, 3, 90}, 0), (std::vector<int>{0, 2}));
    CHECK_EQ(two_sum({1, 2, 3}, 100), std::vector<int>{});
    CHECK_EQ(two_sum({}, 1), std::vector<int>{});
}

TEST(two_sum_does_not_reuse_one_element) {
    CHECK_EQ(two_sum({4, 1, 9}, 8), std::vector<int>{});
}

TEST(is_anagram_cases) {
    CHECK(is_anagram("listen", "silent"));
    CHECK(is_anagram("", ""));
    CHECK_FALSE(is_anagram("a", "b"));
    CHECK_FALSE(is_anagram("aab", "abb"));
    CHECK_FALSE(is_anagram("abc", "abcd"));
    CHECK_FALSE(is_anagram("Abc", "abc"));
}

int main() { return dojo::run_all(); }
