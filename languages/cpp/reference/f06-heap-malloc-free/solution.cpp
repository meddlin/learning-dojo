#include <cstddef>
#include <cstdlib>
#include <cstring>
#include <iostream>

char* duplicate_string(const char* s) {
    std::size_t bytes = std::strlen(s) + 1;
    char* copy = static_cast<char*>(malloc(bytes));
    if (copy == nullptr) return nullptr;
    std::memcpy(copy, s, bytes);
    return copy;
}

int* make_range(int n) {
    if (n <= 0) return nullptr;
    int* a = static_cast<int*>(malloc(static_cast<std::size_t>(n) * sizeof(int)));
    if (a == nullptr) return nullptr;
    for (int i = 0; i < n; ++i) a[i] = i;
    return a;
}

int* grow(int* a, int old_n, int new_n) {
    int* b = static_cast<int*>(calloc(static_cast<std::size_t>(new_n), sizeof(int)));
    if (b == nullptr) return nullptr;
    if (old_n > 0) std::memcpy(b, a, static_cast<std::size_t>(old_n) * sizeof(int));
    free(a);
    return b;
}

void free_all(char** strings, int n) {
    for (int i = 0; i < n; ++i) free(strings[i]);
    free(strings);
}

#ifndef DOJO_TEST
int main() {
    char* copy = duplicate_string("hello");
    if (copy) std::cout << copy << "\n";
    free(copy);
}
#endif
