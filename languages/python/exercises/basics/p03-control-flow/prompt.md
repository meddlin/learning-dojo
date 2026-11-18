# Control flow

## Concept

Blocks are marked by **indentation** (4 spaces) after a colon. There are no braces and no parentheses around conditions.

```python
if temp > 30:
    print("hot")
elif temp > 15:
    print("mild")
else:
    print("cold")

if 0 <= x < 10:        # chained comparison
    ...
label = "even" if n % 2 == 0 else "odd"   # conditional expression
```

**Truthiness**: `0`, `0.0`, `""`, `[]`, `{}`, `set()` and `None` are false; almost everything else is true. So `if items:` means "if the list is not empty". Use `and`, `or`, `not` (words, not symbols).

`for` loops over any iterable. Use `range` for numbers and `enumerate` when you also need the index:

```python
for i in range(3):              # 0, 1, 2
for i in range(10, 0, -2):      # 10, 8, 6, 4, 2
for i, name in enumerate(names):
while queue:                    # loop while the list is non-empty
    item = queue.pop()
```

`break` leaves the loop, `continue` skips to the next round. A loop may have an `else:` that runs only if the loop finished **without** `break`.

Python 3.10 added **`match`**, which matches on the *shape* of data:

```python
match point:
    case (0, 0):
        return "origin"
    case (x, 0):
        return f"on the x axis at {x}"
    case [first, *rest]:            # any sequence with at least one item
        ...
    case "yes" | "y":                # alternatives
        ...
    case _:                          # anything else
        ...
```

## Your task

Implement in `solution.py`:

1. `fizzbuzz(n)`: a list of strings for 1..n: `"Fizz"` for multiples of 3, `"Buzz"` for multiples of 5, `"FizzBuzz"` for both, else the number as a string.
2. `collatz_steps(n)`: how many steps it takes to reach 1 if you repeatedly halve even numbers and turn odd `n` into `3n + 1`. `collatz_steps(1) == 0`, `collatz_steps(6) == 8`.
3. `first_index_over(values, limit)`: the index of the first value greater than `limit`, or `-1`.
4. `grade(score)`: `"A"` for 90 and above, `"B"` for 80+, `"C"` for 70+, `"D"` for 60+, otherwise `"F"`; scores outside 0..100 give `"invalid"`.
5. `respond(command)`: a tiny text-adventure parser, written with `match` on `command.split()`:
   - `"go north"` → `"You go north."` (any single direction word)
   - `"look"` → `"You look around."`
   - `"take rusty key"` → `"You take the rusty key."` (one or more words)
   - `"quit"` or `"exit"` → `"Goodbye."`
   - anything else → `"I don't understand: <command>"` with the command stripped of surrounding spaces.
