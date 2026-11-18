# Sorting, heaps and bisect

## Concept

`sorted(iterable)` returns a new list; `list.sort()` sorts in place. Both take a **`key`** function, computed once per item, and `reverse=True`:

```python
sorted(words, key=len)                         # shortest first
sorted(words, key=str.lower)                   # case-insensitive
sorted(people, key=lambda p: (p.city, -p.age)) # tuple keys: several criteria
from operator import itemgetter
sorted(rows, key=itemgetter("price"))          # same as lambda r: r["price"]
```

Python's sort is **stable**: items that compare equal keep their original order, so you can sort by a secondary key first and the primary key second.

**`heapq`** turns a plain list into a binary min-heap: the smallest item is always at index 0.

```python
import heapq
heap = []
heapq.heappush(heap, (2, "write"))
heapq.heappush(heap, (1, "plan"))
heapq.heappop(heap)              # (1, 'plan'): O(log n)
heapq.nsmallest(3, nums)         # top-k without sorting everything
heapq.nlargest(3, rows, key=...)
heapq.merge(sorted_a, sorted_b)  # lazily merge sorted inputs
```

Tuples are compared item by item, so `(priority, item)` makes a priority queue. When two priorities are equal, the next item is compared, which can fail (or give an order you did not want); a running counter in the middle, `(priority, count, item)`, keeps insertion order for ties.

**`bisect`** does binary search on a sorted list: `bisect_left(a, x)` / `bisect_right(a, x)` give the index where `x` would be inserted, and `insort(a, x)` inserts it there, keeping the list sorted.

## Your task

Implement in `solution.py`:

1. `sort_people(people)`: a list of dicts with `"name"` and `"age"`, sorted by age, then by name.
2. `k_smallest(nums, k)`: the `k` smallest numbers in ascending order.
3. `merge_sorted(lists)`: one sorted list from a list of already-sorted lists.
4. `TaskQueue`: `push(priority, name)`, `pop()` returns the name with the **lowest** priority number (first-in, first-out among equal priorities), and `len(queue)` works.
5. `grade_letters(scores)`: letters for scores with `bisect`: below 60 is `"F"`, 60+ `"D"`, 70+ `"C"`, 80+ `"B"`, 90+ `"A"`. Return a list of letters.
6. `insert_sorted(items, x)`: a new sorted list with `x` inserted; `items` is sorted and must not change.
