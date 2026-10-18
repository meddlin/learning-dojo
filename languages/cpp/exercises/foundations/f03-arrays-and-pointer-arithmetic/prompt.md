# Arrays and pointer arithmetic

## Concept

A C-style array is a block of elements side by side in memory. When you pass an array to a function, it **decays** into a pointer to its first element, and the length is lost. That is why C and C++ functions take `(pointer, count)` or a pair of pointers.

Pointer arithmetic is scaled by the element size:

```cpp
int a[4] = {10, 20, 30, 40};
int* p = a;        // same as &a[0]
*(p + 2);          // 30, identical to a[2]
p + 4;             // one past the end: legal to form and compare, illegal to dereference
```

The standard library describes sequences as **half-open ranges** `[begin, end)`: `begin` points at the first element and `end` points *one past* the last. An empty range is `begin == end`. This convention makes loops and splitting ranges simple, and you will meet it again in the standard algorithms.

Nothing checks bounds for you. Reading or writing outside an array is undefined behaviour. This project compiles with AddressSanitizer, which turns most of those mistakes into an immediate, readable error. The tests pass arrays that are exactly the right size so overruns get caught.

## Your task

Implement these in `solution.cpp`, working with pointers rather than indexes where you can:

1. `int sum_range(const int* begin, const int* end)`: the sum of the ints in `[begin, end)`. An empty range sums to 0.
2. `void reverse_in_place(int* a, int n)`: reverse `n` ints in place using two pointers that walk toward each other. `n` can be 0 or 1.
3. `int* partition_evens(int* begin, int* end)`: rearrange `[begin, end)` so every even number comes before every odd number (order within each group does not matter). Return a pointer to the first odd number, or `end` if there are none.
