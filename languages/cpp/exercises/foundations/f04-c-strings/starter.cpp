#include <cctype>
#include <cstddef>
#include <iostream>

// Number of characters before the terminating '\0'. Do not call strlen.
std::size_t my_strlen(const char* s) {
    return 0;  // TODO
}

// Copy src, including its terminating '\0', into dst. dst is exactly big enough.
void my_strcpy(char* dst, const char* src) {
    // TODO
}

// True if s reads the same forwards and backwards. Case-sensitive. "" counts.
bool is_palindrome(const char* s) {
    return false;  // TODO
}

// Convert each lowercase ASCII letter in s to uppercase, in place.
void to_upper_in_place(char* s) {
    // TODO
}

#ifndef DOJO_TEST
int main() {
    char text[] = "Hello";
    std::cout << my_strlen(text) << "\n";
}
#endif
