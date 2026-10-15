# C strings

## Concept

C has no string type. A "string" is an array of `char` that ends with a zero byte, `'\0'`, called the terminator. The text `"hi"` occupies **three** bytes: `'h'`, `'i'`, `'\0'`.

```cpp
char name[6] = "Alice";   // 5 letters + terminator: exactly 6 bytes
const char* greeting = "hello";   // points at read-only memory
```

Things to keep in your head:

- The length is not stored anywhere. `strlen` walks until it finds `'\0'`, so it is O(n).
- A `char*` parameter does not know how big its buffer is. Copying into a buffer that is too small is a **buffer overflow**, one of the most common sources of security bugs in C.
- String literals such as `"hello"` live in read-only memory. Modifying one is undefined behaviour, so functions that edit text take a `char*` into a writable array, such as `char buf[] = "hello";`.
- A `char` is a small integer. `'a'` is 97, and `'a' - 'A'` is 32.

In day-to-day C++ you will use `std::string`, but you still meet C strings in system APIs, in `main(int argc, char** argv)`, and in plenty of existing code.

## Your task

Re-implement four classic functions in `solution.cpp`. Do not call the library versions (`strlen`, `strcpy`):

1. `std::size_t my_strlen(const char* s)`: the number of characters before the terminator.
2. `void my_strcpy(char* dst, const char* src)`: copy `src` including its terminator into `dst`. `dst` is guaranteed to be big enough, but not bigger.
3. `bool is_palindrome(const char* s)`: true if `s` reads the same backwards. It is case-sensitive, and the empty string counts.
4. `void to_upper_in_place(char* s)`: convert every lowercase ASCII letter in `s` to uppercase; leave everything else alone.
