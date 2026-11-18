# Numbers and variables

## Concept

Python names are **labels on objects**, not boxes with a fixed type. `x = 3` binds the name `x` to an `int` object; `x = "three"` later is fine. `type(x)` tells you what it currently refers to.

```python
count = 3            # int
price = 9.99         # float
name = "ada"         # str
done = False         # bool (True/False are capitalised)
nothing = None       # "no value"
```

**`int` never overflows**: `2 ** 100` is an exact 31-digit number. **`float`** is a 64-bit IEEE double, so `0.1 + 0.2 != 0.3`.

Python has **three division operators**, and mixing them up is a classic bug:

```python
7 / 2      # 3.5   true division: ALWAYS a float, even 6 / 3 == 2.0
7 // 2     # 3     floor division: rounds toward minus infinity, so -7 // 2 == -4
7 % 2      # 1     remainder; its sign follows the divisor: -7 % 2 == 1
divmod(7, 2)   # (3, 1): both at once
```

Converting: `int("42")`, `float("2.5")`, `str(42)`, `int(3.9) == 3` (truncates). `round(2.5) == 2` uses banker's rounding.

**f-strings** put expressions inside `{}` and accept a format spec after a colon:

```python
total = 1234567.891
f"{total:.2f}"     # '1234567.89'   two decimals
f"{total:,.2f}"    # '1,234,567.89' with thousands separators
f"{7:03d}"         # '007'          zero-padded integer
f"{name!r}"        # "'ada'"        repr() of the value
```

## Your task

Implement in `solution.py`:

1. `split_bill(total_cents, people)`: a tuple `(share, leftover)`: how many whole cents each person pays and how many cents are left over. `split_bill(1000, 3) == (333, 1)`.
2. `average(a, b, c)`: the mean of three numbers, always as a `float` (`average(2, 2, 2) == 2.0`).
3. `fahrenheit_label(celsius)`: a string like `"21.5°C is 70.7°F"`, both values with exactly one decimal.
4. `digit_sum(n)`: the sum of the decimal digits of an integer of any size; the sign is ignored (`digit_sum(-123) == 6`).
5. `format_money(cents)`: `123456` becomes `"$1,234.56"`, `5` becomes `"$0.05"` and `-500` becomes `"-$5.00"`.

Press **Run** to execute the `if __name__ == "__main__":` block at the bottom of the file, and **Run Tests** to check your work.
