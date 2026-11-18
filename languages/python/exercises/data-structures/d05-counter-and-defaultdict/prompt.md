# Counter and defaultdict

## Concept

Counting and grouping are so common that the `collections` module has dict subclasses for them.

**`Counter`** counts hashable things:

```python
from collections import Counter

c = Counter("mississippi")        # Counter({'i': 4, 's': 4, 'p': 2, 'm': 1})
c["s"]                            # 4
c["z"]                            # 0: missing keys count as zero, no KeyError
c.most_common(2)                  # [('i', 4), ('s', 4)]: ties keep first-seen order
c.update(["m", "m"])              # add more counts
Counter(a=3) + Counter(a=1, b=2)  # Counter({'a': 4, 'b': 2})
Counter("listen") == Counter("silent")   # True
```

**`defaultdict`** calls a *factory* to create the value the first time a missing key is used:

```python
from collections import defaultdict

by_len = defaultdict(list)        # missing key -> a new empty list
for w in words:
    by_len[len(w)].append(w)      # no setdefault, no "if key not in d"

totals = defaultdict(int)         # missing key -> 0
for name, amount in payments:
    totals[name] += amount
```

Both are real dicts (`isinstance(c, dict)` is `True`). When you hand a `defaultdict` back to other code, `dict(d)` turns it into a plain dict so that reading a missing key raises again instead of silently inserting it.

## Your task

Implement in `solution.py`:

1. `letter_counts(text)`: how often each letter occurs (letters only, lower-cased). Returning a `Counter` is fine.
2. `most_common_word(text)`: the most frequent whitespace-separated word, lower-cased; on a tie, the one that appears first.
3. `is_anagram(a, b)`: `True` if the two phrases use exactly the same letters, ignoring spaces and case.
4. `combine(*counts)`: one dict with the counts of any number of dicts added together.
5. `index_words(lines)`: a plain `dict` from each lower-cased word to the list of 1-based line numbers it appears on, without repeating a line number.
