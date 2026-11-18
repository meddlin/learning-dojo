# Selecting and filtering rows

## Concept

Comparing a column with a value compares **every element at once** and returns a boolean Series, called a **mask**:

```python
df["age"] > 30            # 0 False, 1 True, 2 False ...
df[df["age"] > 30]        # rows where the mask is True
```

Combine masks with the bitwise operators, and **wrap each condition in parentheses** (`&` binds tighter than `>`):

```python
df[(df["age"] > 30) & (df["city"] == "Austin")]   # and
df[(df["dept"] == "Sales") | (df["age"] < 25)]    # or
df[~df["dept"].isin(["Sales", "Marketing"])]      # not; isin = "is one of"
df[df["salary"].between(70_000, 90_000)]          # inclusive range
df[df["name"].str.contains("an", case=False)]     # text matching via .str
df.query("age > 30 and city == 'Austin'")         # the same as a string
```

`and`, `or` and `not` raise "The truth value of a Series is ambiguous": they want one True/False, and a Series has many.

To choose rows **and** columns together, use `.loc[row_selector, column_selector]`:

```python
df.loc[df["age"] > 30, ["name", "city"]]     # filtered rows, two columns
df.loc[df["city"] == "Austin", "salary"].max()
```

Filtering **keeps the original index labels** (you might get rows 1, 4, 5). That is usually what you want, because labels still identify the rows. When you need a fresh 0, 1, 2... index, call `.reset_index(drop=True)` (without `drop=True`, the old index becomes a column).

## Your task

Each function receives an employees frame with the columns `name`, `dept`, `salary`, `age`, `city`. Implement in `solution.py`:

1. `high_earners(df, threshold)`: the rows with a salary above `threshold` (original index kept).
2. `in_departments(df, depts)`: the rows whose department is in the list `depts`.
3. `engineers_under(df, age)`: the `name` and `age` columns of people in `"Engineering"` younger than `age`, re-indexed from 0.
4. `names_containing(df, text)`: a list of the names that contain `text`, ignoring case.
5. `salary_band(df, low, high)`: the `name` and `salary` columns for salaries from `low` to `high` inclusive (original index kept).
6. `max_salary_in(df, city)`: the highest salary in a city, as an `int`.
