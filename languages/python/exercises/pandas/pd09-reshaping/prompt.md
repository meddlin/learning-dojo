# Reshaping: pivot and melt

## Concept

The same data can be laid out two ways:

```
LONG (one row per observation)       WIDE (one row per month, one column per product)
month    product  units              product  gadget  widget
2024-01  widget   10                 month
2024-01  gadget    2                 2024-01       2      10
2024-02  widget    4                 2024-02       0       4
```

Long tables are easy to filter, group and store; wide tables are easy to read and to compare side by side. pandas converts both ways.

**Long → wide** with `pivot_table`, which also aggregates duplicates:

```python
wide = long.pivot_table(index="month", columns="product", values="units",
                        aggfunc="sum",    # what to do with repeated (month, product) pairs
                        fill_value=0)     # instead of NaN for missing combinations
```

(`pivot` without `_table` does no aggregation and raises on duplicates.)

**Wide → long** with `melt`:

```python
long = wide.reset_index().melt(id_vars="month", var_name="product", value_name="units")
```

**`pd.crosstab(a, b)`** counts how often each pair of values occurs: a pivot table of counts in one call.

Row-wise questions on a wide table use `axis=1`: `wide.idxmax(axis=1)` names the column with the largest value in each row; `wide.sum(axis=1)` totals each row.

## Your task

Each function receives a long sales frame with the columns `month` (`"2024-01"`...), `region`, `product` and `units`; the same month and product can appear on several rows. Implement in `solution.py`:

1. `units_wide(df)`: a pivot table with one row per month (index named `month`), one column per product, holding total units, with `0` for combinations that never occur.
2. `to_long(wide)`: turn a frame shaped like the result of `units_wide` back into a long frame with the columns `month`, `product`, `units`, sorted by month then product, index from 0.
3. `region_product_counts(df)`: a crosstab counting the rows for each region (rows) and product (columns).
4. `best_product_per_month(df)`: a dict `{month: the product with the most units that month}`.
