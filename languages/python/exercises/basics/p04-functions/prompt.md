# Functions

## Concept

```python
def area(width, height=1):          # height has a default value
    """Docstring: what the function does."""
    return width * height           # without return, a function returns None

area(3)              # 3
area(3, 4)           # 12
area(height=4, width=3)   # arguments can be passed by name
```

Special parameters:

```python
def f(a, b=2, *args, key=None, **kwargs): ...
#                └ extra positional args, as a tuple
#                         └ after *args (or a bare *): keyword-only
#                                       └ extra keyword args, as a dict

def connect(host, *, timeout=10): ...   # connect("x", timeout=5) only
```

**The mutable default trap.** A default value is evaluated **once**, when `def` runs, and then shared by every call:

```python
def bad(item, items=[]):     # the same list every time!
    items.append(item)
    return items

bad(1)  # [1]
bad(2)  # [1, 2]  surprise
```

Use `None` as the default and create the list inside the function.

Functions are **values**: you can pass them around, store them and return them. A function defined inside another one is a **closure**: it remembers the variables of the enclosing call. To *rebind* such a variable (not just read it), declare it `nonlocal`.

```python
def make_multiplier(k):
    def multiply(x):
        return x * k          # remembers k
    return multiply

double = make_multiplier(2)
double(21)                    # 42
sorted(words, key=len)        # pass a function as an argument
sorted(words, key=lambda w: w[-1])   # lambda: a small anonymous function
```

## Your task

Implement in `solution.py`:

1. `greet(name, greeting="Hello", *, punctuation="!")`: `greet("Ada")` is `"Hello, Ada!"`; `greet("Ada", "Hi", punctuation="?")` is `"Hi, Ada?"`. `punctuation` must be keyword-only.
2. `total(*numbers, start=0)`: `start` plus the sum of any number of positional arguments.
3. `add_item(item, items=None)`: appends `item` to `items` and returns the list. Without a list, start a **new** one each call.
4. `describe(**fields)`: `describe(b=2, a=1)` is `"a=1, b=2"` (keys sorted); `describe()` is `""`.
5. `make_counter()`: returns a function; each call of it returns the next number, starting at 1. Counters are independent.
6. `apply_n(fn, n, x)`: applies `fn` to `x` `n` times: `apply_n(double, 3, 1) == 8`.
