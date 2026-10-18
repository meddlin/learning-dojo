# Structs, references and value semantics

## Concept

A `struct` groups named fields into one type. Unlike Java or Python objects, C++ structs are **values**: assigning or passing one **copies** it.

```cpp
struct Point { int x; int y; };
Point a{1, 2};
Point b = a;   // b is an independent copy
b.x = 99;      // a.x is still 1
```

A function parameter can be passed three ways:

| Declaration | Meaning |
|---|---|
| `void f(Point p)` | `f` gets its own copy. Changes are invisible to the caller. |
| `void f(Point& p)` | `p` is another name for the caller's object. Changes are visible. |
| `void f(const Point& p)` | A read-only alias: no copy, no modification. The default for anything bigger than a few bytes. |

Returning a struct by value is normal and cheap in C++; the compiler constructs it directly in the caller's variable.

A `class` is a struct whose members are private by default, and it can have member functions. A member function marked `const` promises not to change the object, so it can be called through a `const` reference.

## Your task

Implement these in `solution.cpp`:

1. `void translate(Point& p, int dx, int dy)`: move the caller's point.
2. `Point midpoint(const Point& a, const Point& b)`: integer midpoint, `(a.x + b.x) / 2` and likewise for y.
3. `int manhattan(const Point& a, const Point& b)`: `|ax - bx| + |ay - by|`.
4. `bool contains(const Rect& r, const Point& p)`: `x` in `[left, left + width)` and `y` in `[top, top + height)`. The left and top edges are inside, the right and bottom edges are outside. `y` grows downward as on a screen.
5. `Counter::add` and `Counter::value`: a small class with a hidden running total. Copying a `Counter` copies its total, and the copies are independent.
