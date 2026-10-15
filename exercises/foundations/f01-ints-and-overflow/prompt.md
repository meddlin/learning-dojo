# Integers, overflow and undefined behaviour

## Concept

In C and C++ an `int` has a fixed size, almost always 32 bits, so it holds values from `INT_MIN` (-2147483648) to `INT_MAX` (2147483647). The constants live in `<climits>`.

What happens at the edges is where C and C++ differ from most languages you know:

- **Unsigned** types (`unsigned`, `std::uint32_t`) wrap around modulo 2^N. That is defined behaviour.
- **Signed** overflow (`INT_MAX + 1`) is **undefined behaviour** (UB). The compiler is allowed to assume it never happens, so the "result" might be a wrapped number, a deleted branch, or a crash.
- Shifting by an amount greater than or equal to the type's width (`x << 32` on a 32-bit `x`) is also UB.

This project builds your code with *UndefinedBehaviorSanitizer*, which stops the program with a `runtime error:` message the moment UB happens. Read those messages: they tell you the line.

The lesson: you cannot "try it and see whether it overflowed". You have to check *before* doing the operation.

## Your task

Implement the three functions in `solution.cpp`:

1. `bool add_overflows(int a, int b)`: true if `a + b` would not fit in an `int`. You may not compute `a + b` to find out.
2. `int digit_sum(int n)`: the sum of the decimal digits of `n`, ignoring its sign. `digit_sum(-482)` is `14`. It must work for `INT_MIN` too.
3. `std::uint32_t rotate_left(std::uint32_t x, unsigned k)`: rotate the bits of `x` left by `k` positions; bits shifted out on the left re-enter on the right. `k` can be any value, including `0` and numbers above 31.

## Using the environment

- **Run** executes the `main` at the bottom of your file, a scratch area for experiments.
- **Test** runs the exercise's tests against your functions.
- Stuck? Ask for a hint, or ask the tutor a question in the chat panel.
