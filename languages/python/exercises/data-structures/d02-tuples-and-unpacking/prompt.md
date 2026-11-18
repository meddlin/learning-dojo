# Tuples and unpacking

## Concept

A **tuple** is an immutable sequence. It is the natural type for a small fixed-size record, and because it is immutable (and hashable when its items are), it can be a dict key or a set member.

```python
point = (3, 4)
single = (5,)          # the comma makes the tuple, not the parentheses
x, y = point           # unpacking
a, b = b, a            # swap without a temporary
first, *rest = [1, 2, 3, 4]     # first == 1, rest == [2, 3, 4]
*init, last = "abc"            # init == ['a', 'b'], last == 'c'
def bounds(v): return min(v), max(v)   # "returning several values" is returning a tuple
lo, hi = bounds([3, 1, 2])
```

**`zip`** walks several iterables in step, and `zip(*rows)` transposes:

```python
for name, score in zip(names, scores): ...
list(zip(*[(1, "a"), (2, "b")]))   # [(1, 2), ('a', 'b')]
```

A **namedtuple** is a tuple whose fields also have names:

```python
from collections import namedtuple
Point = namedtuple("Point", "x y")
p = Point(3, 4)
p.x, p[1]            # 3, 4
p._replace(x=0)      # Point(x=0, y=4): a new tuple
```

Tuples compare **lexicographically**: item by item. That makes them perfect sort keys: `sorted(people, key=lambda p: (p.city, -p.age))` sorts by city, then by age descending.

## Your task

Implement in `solution.py`:

1. `min_max(values)`: the tuple `(smallest, largest)`; raise `ValueError` if `values` is empty.
2. `head_tail(items)`: `(first item, list of the rest)`, using starred unpacking.
3. `parse_point(text)`: `"3,4"` becomes `Point(x=3, y=4)` (the `Point` namedtuple is defined for you); spaces around the numbers are allowed.
4. `transpose(pairs)`: `[(1, "a"), (2, "b")]` becomes `((1, 2), ("a", "b"))`.
5. `swap_pairs(pairs)`: a list with each pair's two items swapped.
6. `rank(records)`: a list of `(name, score)` tuples sorted by score, highest first; ties are broken by name, A to Z.
