#include <cctype>
#include <cstddef>
#include <iostream>

std::size_t my_strlen(const char* s) {
    std::size_t n = 0;
    while (s[n] != '\0') ++n;
    return n;
}

void my_strcpy(char* dst, const char* src) {
    while (*src != '\0') {
        *dst++ = *src++;
    }
    *dst = '\0';
}

bool is_palindrome(const char* s) {
    std::size_t len = my_strlen(s);
    for (std::size_t i = 0; i < len / 2; ++i) {
        if (s[i] != s[len - 1 - i]) return false;
    }
    return true;
}

void to_upper_in_place(char* s) {
    for (; *s != '\0'; ++s) {
        *s = static_cast<char>(std::toupper(static_cast<unsigned char>(*s)));
    }
}

#ifndef DOJO_TEST
int main() {
    char text[] = "Hello";
    std::cout << my_strlen(text) << "\n";
}
#endif
