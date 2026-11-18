# Missing data and duplicates

## Concept

pandas marks missing values as **`NaN`** in numeric columns (it is a float, which is why an int column with a gap becomes `float64`), `NaT` in datetime columns, and `NaN` or `None` in text columns. Newer nullable dtypes (`"Int64"`, `"string"`) use `pd.NA`. Whatever the marker, use the same tools:

```python
df.isna()                      # True where missing (also df.notna())
df.isna().sum()                # missing count per column
df.isna().any(axis=1)          # rows with at least one gap
df["temp"].mean()              # aggregations skip NaN by default

df.dropna()                    # drop rows with ANY missing value
df.dropna(subset=["temp"])     # only consider some columns
df.fillna(0)                   # same value everywhere
df.fillna({"temp": 20.0, "note": "none"})   # per column
df["temp"].ffill()             # carry the last seen value forward
```

Never compare with `==` to find gaps: `NaN == NaN` is `False`. Use `isna()`.

Forward-filling a column that holds several series (one per sensor, per customer...) must not leak values from one series into the next. **Group first**: `df.groupby("sensor")["temp"].ffill()` fills within each sensor separately and returns a Series aligned with the original rows.

**Duplicates**: `df.duplicated()` marks rows identical to an earlier one; `df.drop_duplicates()` removes them (`subset=[...]` to compare only some columns, `keep="last"` to keep the last copy).

As always, these methods return new frames.

## Your task

Each function receives a sensor-readings frame with the columns `sensor`, `day`, `temp`, `humidity`, `note`, sorted by sensor and day. Implement in `solution.py`:

1. `missing_counts(df)`: a dict `{column: number of missing values}` with plain `int` counts, for every column.
2. `rows_with_missing(df)`: how many rows have at least one missing value, as an `int`.
3. `drop_incomplete(df, required)`: the rows that have a value in every column of the list `required`.
4. `fill_defaults(df)`: missing `temp` becomes the mean of the known temps rounded to 1 decimal, missing `humidity` becomes `0`, missing `note` becomes `"none"`.
5. `forward_fill_temps(df)`: missing `temp` values are filled with the previous reading **of the same sensor**; a sensor's first reading stays missing if it is missing.
6. `dedupe(df)`: drop exact duplicate rows (keep the first) and renumber the index from 0.
