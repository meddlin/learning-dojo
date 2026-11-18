# Lists

## Concept

A `list` is an ordered, **mutable** sequence that can hold anything.

```python
nums = [3, 1, 2]
nums.append(4)          # [3, 1, 2, 4]       add one item
nums.extend([5, 6])     # [3, 1, 2, 4, 5, 6] add many
nums.insert(0, 9)       # put 9 at index 0
last = nums.pop()       # remove and return the last item (pop(0): the first, but slow)
nums.remove(9)          # remove the first 9 (ValueError if absent)
nums.sort()             # sorts IN PLACE and returns None
ordered = sorted(nums)  # returns a NEW sorted list
nums[1:3]               # a slice is a new list
nums[::-1]              # reversed copy
3 in nums               # membership (a linear scan)
```

**Names are references.** `b = a` does not copy the list; both names point at the same object, so a change through one is visible through the other. Copy with `a.copy()`, `list(a)` or `a[:]` (all *shallow*: nested lists are still shared).

```python
a = [1, 2]
b = a            # alias
b.append(3)      # a is now [1, 2, 3] too
c = a[:]         # a real (shallow) copy
```

The classic trap: `[[0] * 3] * 2` is a list containing **the same inner list twice**. Build each row separately with a comprehension.

Functions that mutate a list in place usually return `None` (like `list.sort`). If a caller passes you a list and expects *that* list to change, modify it in place, for example with slice assignment: `items[:] = new_values`.

## Your task

Implement in `solution.py` (do not change the inputs unless told to):

1. `rotate(items, k)`: a new list rotated `k` places to the right: `rotate([1, 2, 3, 4], 1) == [4, 1, 2, 3]`. `k` can be larger than the list or negative (rotate left). An empty list stays empty.
2. `dedupe(items)`: a new list without duplicates, keeping the first occurrence of each item, in order.
3. `flatten(nested)`: one level of nesting removed: `[[1, 2], [], [3]]` becomes `[1, 2, 3]`.
4. `moving_average(values, window)`: the averages of each run of `window` consecutive values, as floats. Fewer values than `window` gives `[]`.
5. `make_grid(rows, cols, fill=0)`: a list of `rows` lists, each with `cols` copies of `fill`. The rows must be independent.
6. `remove_all(items, value)`: removes every `value` from `items` **in place** and returns `None`.
