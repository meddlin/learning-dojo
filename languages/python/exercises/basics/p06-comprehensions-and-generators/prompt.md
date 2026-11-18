# Comprehensions and generators

## Concept

A **comprehension** builds a collection from an iterable in one expression:

```python
squares = [n * n for n in range(5)]                 # [0, 1, 4, 9, 16]
evens   = [n for n in nums if n % 2 == 0]           # with a filter
lengths = {word: len(word) for word in words}       # dict comprehension
firsts  = {word[0] for word in words}               # set comprehension
grid    = [(r, c) for r in range(2) for c in range(3)]   # nested: outer loop first
```

Read it left to right as "*this expression*, for each item, if the condition holds". When a comprehension stops being readable, use a normal loop.

With round brackets you get a **generator expression**: it produces values one at a time instead of building a list, so it works on huge inputs with constant memory:

```python
total = sum(n * n for n in range(10_000_000))   # no 10-million-item list
```

A function that contains `yield` is a **generator function**. Calling it does not run the body; it returns a generator, and the body runs a step at a time each time a value is requested (by `next()`, a `for` loop, `list()`...):

```python
def countdown(n):
    while n > 0:
        yield n        # pause here, hand out n
        n -= 1

for x in countdown(3):  # 3, 2, 1
    print(x)
```

Generators can even be infinite; take what you need with `itertools.islice(gen, 10)`.

## Your task

Implement in `solution.py`:

1. `squares_of_evens(numbers)`: a list of the squares of the even numbers, in order.
2. `word_lengths(words)`: a dict from each word to its length.
3. `invert(d)`: a new dict with keys and values swapped (values are unique).
4. `lengths_used(words)`: the set of distinct word lengths.
5. `count_long(words, n)`: how many words are longer than `n` characters, using a generator expression.
6. `pairs(xs, ys)`: a list of all `(x, y)` tuples with `x` from `xs` and `y` from `ys`, skipping pairs where `x == y`, in loop order.
7. `chunked(items, size)`: a **generator** that yields lists of `size` items from any iterable; the last one may be shorter. Raise `ValueError` if `size < 1`.
8. `fibonacci()`: an infinite generator of Fibonacci numbers: 0, 1, 1, 2, 3, 5, 8...
