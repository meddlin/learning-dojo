#include <iostream>

void swap_ints(int* a, int* b) {
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

void min_max(const int* values, int n, int* out_min, int* out_max) {
    *out_min = values[0];
    *out_max = values[0];
    for (int i = 1; i < n; ++i) {
        if (values[i] < *out_min) *out_min = values[i];
        if (values[i] > *out_max) *out_max = values[i];
    }
}

bool bump_if_positive(int* p) {
    if (p == nullptr || *p <= 0) return false;
    ++*p;
    return true;
}

int* find_first(int* values, int n, int target) {
    for (int i = 0; i < n; ++i) {
        if (values[i] == target) return &values[i];
    }
    return nullptr;
}

#ifndef DOJO_TEST
int main() {
    int a = 1, b = 2;
    swap_ints(&a, &b);
    std::cout << a << " " << b << "\n";
}
#endif
