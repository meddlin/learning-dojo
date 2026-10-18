#include <cstddef>
#include <cstdlib>
#include <cstring>
#include <iostream>

// Return a newly allocated copy of s, terminator included. The CALLER frees it.
char* duplicate_string(const char* s) {
    return nullptr;  // TODO
}

// Return a newly allocated array {0, 1, ..., n-1}. For n <= 0 return nullptr.
// The CALLER frees it.
int* make_range(int n) {
    return nullptr;  // TODO
}

// Return a new array of new_n ints (new_n > old_n): the first old_n values are copied
// from a, the rest are 0. Free the old array a (it may be nullptr when old_n == 0).
// The CALLER frees the result.
int* grow(int* a, int old_n, int new_n) {
    return nullptr;  // TODO
}

// Free each of the n strings in `strings`, then the array of pointers itself.
void free_all(char** strings, int n) {
    // TODO
}

#ifndef DOJO_TEST
int main() {
    char* copy = duplicate_string("hello");
    if (copy) std::cout << copy << "\n";
    free(copy);
}
#endif
