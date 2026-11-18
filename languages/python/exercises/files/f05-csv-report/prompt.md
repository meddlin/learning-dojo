# A CSV report

## Concept

Most "data analysis" boils down to **split, apply, combine**: split the rows into groups by some key, compute something per group (a sum, a count, a maximum), and combine the results into a table. With plain Python, a dict keyed by the group does it:

```python
from collections import defaultdict

totals = defaultdict(float)
for row in rows:
    totals[row["region"]] += row["amount"]
```

Dates in CSV files are strings. `datetime.strptime` parses them with a format, and `strftime` formats them back:

```python
from datetime import datetime
d = datetime.strptime("2024-03-15", "%Y-%m-%d")
d.year, d.month, d.strftime("%Y-%m")     # 2024, 3, '2024-03'
```

Floating-point sums of money pick up noise (`0.1 + 0.2 == 0.30000000000000004`), so **round at the end** for presentation (`round(x, 2)`, or `f"{x:.2f}"` in output). For real accounting you would use `decimal.Decimal` or integer cents.

After this exercise, compare how much shorter the same report is with pandas (the next track).

## Your task

Each function reads a sales CSV with the columns `date` (`YYYY-MM-DD`), `region`, `product`, `units` and `unit_price`. A row's revenue is `units * unit_price`. Implement in `solution.py`:

1. `revenue_by_region(path)`: `{region: revenue}` with revenues rounded to 2 decimals and regions in alphabetical order.
2. `best_seller(path)`: `(product, total units)` for the product with the most units sold; on a tie, the product that appears first in the file.
3. `monthly_revenue(path)`: `{"YYYY-MM": revenue}` in chronological order, rounded to 2 decimals.
4. `write_summary(src, dst)`: write a CSV with the header `region,orders,units,revenue`: one row per region with its number of rows, total units and total revenue formatted with exactly two decimals (`"1234.50"`), sorted by revenue, highest first (ties by region name).
