#define DOJO_TRACK_NEW
#include "dojo.h"
#include "solution.cpp"

static_assert(!std::is_copy_constructible_v<IntStack>, "IntStack must not be copyable");

TEST(starts_empty) {
    IntStack s;
    CHECK(s.empty());
    CHECK_EQ(s.size(), 0u);
}

TEST(last_in_first_out) {
    IntStack s;
    s.push(1);
    s.push(2);
    s.push(3);
    CHECK_EQ(s.size(), 3u);
    CHECK_EQ(s.top(), 3);
    CHECK_EQ(s.pop(), 3);
    CHECK_EQ(s.pop(), 2);
    CHECK_EQ(s.pop(), 1);
    CHECK(s.empty());
}

TEST(values_survive_growth) {
    IntStack s;
    for (int i = 0; i < 1000; ++i) {
        s.push(i);
        CHECK_EQ(s.top(), i);
    }
    CHECK_EQ(s.size(), 1000u);
    CHECK(s.capacity() >= 1000u);
    for (int i = 999; i >= 0; --i) CHECK_EQ(s.pop(), i);
}

TEST(pop_on_empty_throws_out_of_range) {
    IntStack s;
    bool threw = false;
    try {
        s.pop();
    } catch (const std::out_of_range&) {
        threw = true;
    }
    CHECK(threw);
}

TEST(top_on_empty_throws_out_of_range) {
    IntStack s;
    bool threw = false;
    try {
        s.top();
    } catch (const std::out_of_range&) {
        threw = true;
    }
    CHECK(threw);
    s.push(5);
    s.pop();
    threw = false;
    try {
        s.top();
    } catch (const std::out_of_range&) {
        threw = true;
    }
    CHECK(threw);
}

TEST(destructor_frees_the_array) {
    dojo::AllocScope scope;
    {
        IntStack s;
        for (int i = 0; i < 100; ++i) s.push(i);
        CHECK_EQ(scope.leaked_news(), 1);
    }
    CHECK_EQ(scope.leaked_news(), 0);
}

TEST(growth_frees_the_old_arrays) {
    dojo::AllocScope scope;
    IntStack s;
    for (int i = 0; i < 500; ++i) s.push(i);
    long alive = scope.leaked_news();  // measure before INFO, which allocates a string itself
    INFO("after 500 pushes exactly one array should still be alive");
    CHECK_EQ(alive, 1);
}

TEST(growth_is_geometric) {
    dojo::AllocScope scope;
    IntStack s;
    for (int i = 0; i < 1000; ++i) s.push(i);
    long made = scope.allocated_news();
    INFO("allocating a new array on almost every push is O(n^2); double the capacity instead");
    CHECK(made <= 14);
}

int main() { return dojo::run_all(); }
