# Pointers: addresses and out-parameters

## Concept

A **pointer** is a variable whose value is a memory address. Two operators go with it:

- `&x` means "the address of `x`".
- `*p` means "the thing `p` points to" (dereferencing).

```cpp
int x = 5;
int* p = &x;   // p holds the address of x
*p = 7;        // writes through the pointer: x is now 7
```

Why bother? In C++ (as in C) arguments are **copied** into the function. If a function should change the caller's variable, or return several results, the caller passes the *address* and the function writes through it. These are called out-parameters.

A pointer can hold "no address" with the value `nullptr`. Dereferencing `nullptr` is undefined behaviour (usually a crash), so code that accepts pointers from outside often checks first: `if (p == nullptr) return false;`.

Finally, `const int*` means "pointer to an int that I promise not to modify through this pointer".

## Your task

Implement these four functions in `solution.cpp`:

1. `void swap_ints(int* a, int* b)`: swap the two ints they point to. It must be harmless if both pointers point at the same int.
2. `void min_max(const int* values, int n, int* out_min, int* out_max)`: `n >= 1`. Write the smallest and largest value through the out pointers.
3. `bool bump_if_positive(int* p)`: if `p` is not null and `*p > 0`, add one to `*p` and return `true`; otherwise return `false` and change nothing.
4. `int* find_first(int* values, int n, int target)`: return a pointer to the first element equal to `target`, or `nullptr` if there is none. The tests write through the returned pointer to check that you returned an address *into the array* and not a copy.

## Tips

- If a test crashes, the terminal shows which test was running and the sanitizer's explanation. A "SEGV on address 0x000000000000" almost always means a null pointer was dereferenced.
