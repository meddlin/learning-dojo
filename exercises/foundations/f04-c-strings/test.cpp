#include "dojo.h"
#include "solution.cpp"

TEST(my_strlen_counts_characters) {
    CHECK_EQ(my_strlen(""), 0u);
    CHECK_EQ(my_strlen("a"), 1u);
    CHECK_EQ(my_strlen("hello"), 5u);
}

TEST(my_strlen_stops_at_the_terminator) {
    char buf[] = {'a', 'b', '\0', 'c', '\0'};
    CHECK_EQ(my_strlen(buf), 2u);
}

TEST(my_strcpy_copies_text_and_terminator) {
    char dst[6];
    my_strcpy(dst, "hello");
    CHECK_EQ(std::string(dst), "hello");
}

TEST(my_strcpy_empty_string) {
    char dst[1] = {'x'};
    my_strcpy(dst, "");
    CHECK(dst[0] == '\0');
}

TEST(my_strcpy_does_not_write_past_the_terminator) {
    char dst[8];
    std::memset(dst, '#', sizeof dst);
    my_strcpy(dst, "abc");
    CHECK(dst[0] == 'a' && dst[1] == 'b' && dst[2] == 'c');
    CHECK(dst[3] == '\0');
    CHECK(dst[4] == '#');
}

TEST(is_palindrome_yes_cases) {
    CHECK(is_palindrome(""));
    CHECK(is_palindrome("a"));
    CHECK(is_palindrome("abba"));
    CHECK(is_palindrome("racecar"));
}

TEST(is_palindrome_no_cases) {
    CHECK_FALSE(is_palindrome("ab"));
    CHECK_FALSE(is_palindrome("abca"));
    CHECK_FALSE(is_palindrome("Abba"));
}

TEST(to_upper_in_place_changes_letters_only) {
    char s[] = "Hello, World 42!";
    to_upper_in_place(s);
    CHECK_EQ(std::string(s), "HELLO, WORLD 42!");
}

TEST(to_upper_in_place_empty) {
    char s[] = "";
    to_upper_in_place(s);
    CHECK(s[0] == '\0');
}

int main() { return dojo::run_all(); }
