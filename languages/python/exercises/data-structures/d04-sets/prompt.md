# Sets

## Concept

A `set` holds **unique**, hashable items with no order. Membership tests (`x in s`) are O(1) on average, compared with O(n) for a list.

```python
s = {1, 2, 3}
empty = set()          # NOT {}: that is an empty dict
s.add(4)
s.discard(10)          # no error if absent (remove() raises KeyError)
3 in s                 # True
unique = set([3, 1, 3, 2])   # {1, 2, 3}
initials = {name[0] for name in names}   # set comprehension
```

Set algebra, as operators or methods:

```python
a = {1, 2, 3}; b = {2, 3, 4}
a | b      # {1, 2, 3, 4}  union          a.union(b)
a & b      # {2, 3}        intersection   a.intersection(b)
a - b      # {1}           difference     a.difference(b)
a ^ b      # {1, 4}        in exactly one (symmetric difference)
{1, 2} <= a                # subset test   .issubset()
set.intersection(*list_of_sets)   # intersect any number at once
```

The methods accept any iterable (`a.union([5, 6])`); the operators need sets on both sides.

Because sets have no order, convert to a sorted list when order matters for output. A `frozenset` is an immutable set, usable as a dict key or inside another set.

## Your task

Implement in `solution.py`:

1. `has_duplicates(items)`: `True` if any item appears more than once.
2. `common(a, b)`: the set of items in both iterables.
3. `only_in_first(a, b)`: the set of items in `a` but not in `b`.
4. `in_exactly_one(a, b)`: the set of items in exactly one of them.
5. `missing_numbers(nums, n)`: a **sorted list** of the numbers from 1 to `n` that do not appear in `nums`.
6. `unique_letters(word)`: `True` if no letter repeats, ignoring case (`"Alpha"` repeats `a`).
7. `shared_by_all(groups)`: the items present in every set of the list `groups`; an empty list gives an empty set.
8. `is_subset(small, big)`: `True` if every item of `small` is in `big`.
