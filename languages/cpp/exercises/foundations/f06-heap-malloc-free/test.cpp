#include "dojo.h"
// Track plain malloc/calloc/realloc/free so leaks and double frees are visible to the tests.
#define malloc(n) dojo::c_malloc(n)
#define calloc(a, b) dojo::c_calloc(a, b)
#define realloc(p, n) dojo::c_realloc(p, n)
#define free(p) dojo::c_free(p)
#include "solution.cpp"

TEST(duplicate_string_copies_the_text) {
    dojo::AllocScope scope;
    char* d = duplicate_string("hello");
    CHECK(d != nullptr);
    CHECK_EQ(std::string(d), "hello");
    CHECK_EQ(scope.leaked_mallocs(), 1);
    free(d);
    CHECK_EQ(scope.leaked_mallocs(), 0);
}

TEST(duplicate_string_is_an_independent_copy) {
    char original[] = "abc";
    char* d = duplicate_string(original);
    CHECK(d != nullptr);
    original[0] = 'X';
    CHECK_EQ(std::string(d), "abc");
    free(d);
}

TEST(duplicate_string_empty) {
    char* d = duplicate_string("");
    CHECK(d != nullptr);
    CHECK(d[0] == '\0');
    free(d);
}

TEST(make_range_fills_values) {
    dojo::AllocScope scope;
    int* a = make_range(5);
    CHECK(a != nullptr);
    CHECK_EQ(std::vector<int>(a, a + 5), std::vector<int>{0, 1, 2, 3, 4});
    free(a);
    CHECK_EQ(scope.leaked_mallocs(), 0);
}

TEST(make_range_non_positive_is_null) {
    CHECK(make_range(0) == nullptr);
    CHECK(make_range(-3) == nullptr);
}

TEST(grow_copies_and_zero_fills) {
    dojo::AllocScope scope;
    int* a = make_range(3);
    CHECK(a != nullptr);
    int* b = grow(a, 3, 6);
    CHECK(b != nullptr);
    CHECK_EQ(std::vector<int>(b, b + 6), std::vector<int>{0, 1, 2, 0, 0, 0});
    CHECK_EQ(scope.leaked_mallocs(), 1);  // only b is alive: a was freed by grow
    free(b);
    CHECK_EQ(scope.leaked_mallocs(), 0);
}

TEST(grow_from_nothing) {
    int* b = grow(nullptr, 0, 4);
    CHECK(b != nullptr);
    CHECK_EQ(std::vector<int>(b, b + 4), std::vector<int>{0, 0, 0, 0});
    free(b);
}

TEST(free_all_releases_everything) {
    dojo::AllocScope scope;
    char** words = static_cast<char**>(malloc(3 * sizeof(char*)));
    for (int i = 0; i < 3; ++i) {
        words[i] = static_cast<char*>(malloc(2));
        words[i][0] = static_cast<char>('a' + i);
        words[i][1] = '\0';
    }
    CHECK_EQ(scope.leaked_mallocs(), 4);
    free_all(words, 3);
    CHECK_EQ(scope.leaked_mallocs(), 0);
}

int main() { return dojo::run_all(); }
