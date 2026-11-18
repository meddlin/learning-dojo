# Computing new columns

## Concept

Operations on columns are **vectorised**: they apply to every row at once, in fast compiled code. Write them like arithmetic on single values, and avoid Python loops and `df.apply(..., axis=1)` when a vectorised form exists.

```python
df["total"] = df["quantity"] * df["unit_price"]       # adds a column IN PLACE
df["total"] = df["total"].round(2)
df["is_big"] = df["total"] > 100                      # boolean column
```

`assign` does the same but returns a **new** frame and leaves the original untouched, which makes functions safer and lets you chain steps:

```python
out = df.assign(total=df["quantity"] * df["unit_price"],
                taxed=lambda d: d["total"] * 1.2)   # a lambda sees the frame being built
```

Choosing between values per row:

```python
import numpy as np
np.where(df["qty"] >= 10, "bulk", "single")          # if/else per element
df["country"].map({"US": "Americas", "FR": "Europe"})  # look up in a dict; missing -> NaN
df["score"].clip(0, 100)
pd.cut(df["age"], bins=[0, 18, 65, np.inf], labels=["child", "adult", "senior"])
```

String columns have a **`.str`** accessor with the usual methods (`strip`, `lower`, `title`, `replace`, `contains`, `split`, `len`...), applied element-wise.

**Do not modify a function's input** unless that is its job. If a function receives `df` and writes `df["x"] = ...`, the caller's frame changes too. Use `assign`, or start with `df = df.copy()`. (Assigning into a *filtered* frame is the source of pandas' famous `SettingWithCopyWarning`; pandas 3's copy-on-write rules make such writes never affect the original.)

## Your task

Each function receives an orders frame with the columns `order_id`, `product`, `quantity`, `unit_price`, `country`, and must return a **new** frame with every original column plus one new column, leaving the input unchanged. Implement in `solution.py`:

1. `add_total(df)`: `total` = quantity × unit_price, rounded to 2 decimals.
2. `add_size(df)`: `size` is `"bulk"` when quantity is 10 or more, otherwise `"single"`.
3. `add_region(df, regions)`: `region` looked up from the dict `regions` (country → region); countries not in it get `"Other"`.
4. `clean_products(df)`: same columns, but `product` stripped of surrounding spaces and in title case (`" widget "` → `"Widget"`).
5. `add_price_band(df)`: `band` is `"cheap"` below 5, `"mid"` from 5 up to (not including) 15, and `"premium"` from 15. Use `pd.cut`.
