# The heap: malloc and free

## Concept

Local variables live on the **stack**: they appear when a function is entered and vanish when it returns. Memory that must outlive a function call, or whose size is only known at run time, comes from the **heap**.

In C style you ask for bytes and give them back by hand:

```cpp
int* a = static_cast<int*>(malloc(5 * sizeof(int)));   // 5 ints, uninitialised
// ... use a[0] .. a[4] ...
free(a);                                                  // exactly once
```

The rules that cause most memory bugs:

- **Every `malloc` needs exactly one `free`.** Forgetting is a *leak*; freeing twice is a *double free* (undefined behaviour); using memory after freeing is a *use-after-free*. AddressSanitizer catches the last two.
- **Ownership must be clear.** When a function returns a heap pointer, the caller owns it and must free it. Document it in a comment, as the starter file does.
- `malloc` returns uninitialised memory. `calloc(count, size)` returns zeroed memory.
- **C++ difference:** `malloc` returns `void*`, and C++ does not convert that to `int*` implicitly. You must cast, as above. (C code does not need the cast.)

In modern C++ you would use `std::vector` or smart pointers and almost never call `malloc`. Doing it by hand once shows you what they do for you.

## Your task

Implement these in `solution.cpp` using plain `malloc` / `calloc` / `free` (not `std::malloc`; the tests track the plain names to detect leaks):

1. `char* duplicate_string(const char* s)`: return a new heap copy of `s` including the terminator. The caller frees it.
2. `int* make_range(int n)`: return a new array `{0, 1, ..., n-1}`. For `n <= 0` return `nullptr`. The caller frees it.
3. `int* grow(int* a, int old_n, int new_n)`: return a new array of `new_n` ints (`new_n > old_n`) whose first `old_n` values are copied from `a` and the rest are 0. Free the old array `a` (it may be `nullptr` when `old_n == 0`). The caller frees the result.
4. `void free_all(char** strings, int n)`: free each of the `n` strings, then the array itself.

The tests count live allocations: leaking one block or freeing one too many fails a test.
