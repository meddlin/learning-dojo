# Exceptions

## Concept

Errors in Python are **exceptions**: objects that are *raised* and travel up the call stack until something *catches* them. If nothing does, the program stops with a traceback.

```python
try:
    value = int(text)
except ValueError:
    value = 0                   # runs only if int() raised ValueError
except (TypeError, KeyError) as e:
    print("odd input:", e)      # e is the exception object
else:
    print("parsed fine")        # runs only if nothing was raised
finally:
    print("always runs")        # cleanup, whatever happened
```

Catch the **specific** exceptions you expect. A bare `except:` also swallows typos (`NameError`) and Ctrl-C.

Raising your own:

```python
if amount <= 0:
    raise ValueError("amount must be positive")
```

**Custom exceptions** are classes that inherit from `Exception`; they can carry extra data:

```python
class OutOfStock(Exception):
    def __init__(self, item):
        super().__init__(f"{item} is out of stock")   # the message str(e) shows
        self.item = item
```

When you turn one error into another, chain them with `from` so the original cause is kept in the traceback (as `e.__cause__`):

```python
try:
    port = int(raw)
except ValueError as e:
    raise ConfigError(f"bad port {raw!r}") from e
```

Python style is **EAFP**, "easier to ask forgiveness than permission": try the operation and handle the failure, rather than checking every precondition first.

## Your task

Implement in `solution.py`:

1. `parse_int(text, default=None)`: the integer in `text` (surrounding spaces allowed), or `default` if it is not a valid integer.
2. `safe_divide(a, b)`: `a / b`, or `None` when `b` is zero.
3. `class InsufficientFunds(Exception)` with attributes `needed` and `available`; `str(error)` is `"need 50, have 20"`.
4. `withdraw(balance, amount)`: the new balance. Raise `ValueError` if `amount <= 0`, and `InsufficientFunds(amount, balance)` if `amount > balance`.
5. `parse_age(text)`: an int from 0 to 150. If `text` is not a whole number, raise `ValueError("age must be a whole number")` **chained** from the original error; if it is out of range, raise `ValueError("age out of range")`.
6. `first_error(functions)`: call each zero-argument function in turn and return the **name** of the first exception type raised (for example `"KeyError"`), or `None` if none raise.
