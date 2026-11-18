# Dictionaries

## Concept

A `dict` maps hashable **keys** (str, int, tuple...) to values. Lookups, inserts and deletes are O(1) on average, and since Python 3.7 a dict **remembers insertion order**.

```python
ages = {"ada": 36, "grace": 45}
ages["linus"] = 28            # insert or overwrite
ages["ada"]                   # 36; a missing key raises KeyError
ages.get("bob")               # None instead of an error
ages.get("bob", 0)            # or a default of your choice
"ada" in ages                 # True: checks keys
del ages["linus"]
ages.pop("grace", None)       # remove and return, with a default

for name, age in ages.items():   # also .keys() and .values()
    print(name, age)

squares = {n: n * n for n in range(4)}     # dict comprehension
merged = defaults | overrides              # new dict, right side wins (3.9+)
```

`setdefault(key, default)` returns the value for `key`, inserting `default` first if the key is missing. It is handy for building groups:

```python
groups = {}
for word in words:
    groups.setdefault(len(word), []).append(word)
```

Dicts are mutable and passed by reference: if a function should not change its input, copy it first (`dict(d)` or `d.copy()`, both shallow).

Real data (JSON, configs, API responses) is often **nested** dicts and lists, so you will often walk a path of keys.

## Your task

Implement in `solution.py`:

1. `word_count(text)`: how often each word occurs, case-insensitively. Strip the punctuation `.,!?;:` from both ends of each word, and skip words that end up empty. Keys appear in order of first occurrence.
2. `group_by_first_letter(words)`: a dict from lower-case first letter to the list of words starting with it, in their original order.
3. `merge_inventory(a, b)`: a **new** dict with the counts of both inventories added together; neither input may change.
4. `top_n(counts, n)`: the `n` `(key, count)` pairs with the highest counts, highest first, ties alphabetically.
5. `get_path(data, path, default=None)`: look up a dotted path in nested dicts: `get_path({"a": {"b": 1}}, "a.b") == 1`. Return `default` if any step is missing (or is not a dict).
