# Group by and aggregate

## Concept

`groupby` is pandas' version of the dict-of-totals loops from the CSV report: **split** the rows into groups by key, **apply** a function to each group, **combine** the results.

```python
g = df.groupby("region")              # nothing is computed yet
g["revenue"].sum()                    # Series: one total per region, index = region (sorted)
g["revenue"].agg(["sum", "mean"])     # several statistics
g.size()                              # rows per group (count() counts non-missing values)
df.groupby(["region", "rep"])["revenue"].sum()   # two keys -> a MultiIndex
```

**Named aggregation** gives the result columns the names you want:

```python
df.groupby("region").agg(
    orders=("revenue", "size"),       # new_name=(column, function)
    units=("units", "sum"),
    avg_revenue=("revenue", "mean"),
).reset_index()                        # region back to a normal column
```

The group keys become the **index** of the result. `reset_index()` (or `groupby(..., as_index=False)`) turns them back into columns, which is what you want before writing a CSV or merging.

Two more shapes of answer:

- **`transform`** returns a result the *same length as the input*, aligned with the original rows (each row gets its group's value). Use it to compare a row with its group: `df["revenue"] / df.groupby("region")["revenue"].transform("sum")`.
- **`idxmax`** gives the index label of the maximum; on a grouped Series it finds the best row of each group.

## Your task

Each function receives a sales frame with the columns `region`, `rep`, `product`, `units`, `revenue` (one row per order). Implement in `solution.py`:

1. `revenue_by_region(df)`: a Series of total revenue per region, indexed by region in alphabetical order, named `revenue`.
2. `region_summary(df)`: a DataFrame with the columns `region`, `orders` (number of rows), `units` (sum) and `avg_revenue` (mean revenue per order, rounded to 2), one row per region in alphabetical order, indexed from 0.
3. `top_rep_by_region(df)`: a dict `{region: rep}` naming the rep with the highest **total** revenue in each region.
4. `add_region_share(df)`: a new frame with a `share` column: each order's revenue divided by its region's total revenue, rounded to 3 decimals.
5. `regions_with_at_least(df, n)`: an alphabetical list of the regions with at least `n` orders.
