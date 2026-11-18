# Series and DataFrames

## Concept

pandas has two core types:

- a **Series**: a one-dimensional array of values *with labels* (its **index**) and one dtype;
- a **DataFrame**: a table of named columns, each column a Series, all sharing one index.

```python
import pandas as pd

df = pd.DataFrame({
    "name": ["Ada", "Grace"],
    "age": [36, 45],
})                       # also: pd.DataFrame(list_of_dicts)

df.shape                 # (2, 2): rows, columns
df.columns               # Index(['name', 'age'], ...)
df.dtypes                # name: str (object in pandas 2), age: int64
df.head(), df.tail(3)    # first / last rows
df.describe()            # summary statistics of numeric columns
df["age"]                # one column: a Series
df[["name", "age"]]      # a list of columns: a DataFrame
df["age"].mean()         # columns have vectorised methods: sum, max, min, mean...
```

Every row has an **index label**. By default it is `0, 1, 2...`, but any column can become the index:

```python
people = df.set_index("name")   # returns a NEW frame; df is unchanged
people.loc["Ada"]               # .loc: by LABEL  -> that row, as a Series
people.loc["Ada", "age"]        # one cell
df.iloc[0]                      # .iloc: by POSITION (0-based, like a list)
df.iloc[[0, -1]]                # several rows; their labels are kept
df.iloc[:2, 1]                  # rows 0-1, column at position 1
```

Most pandas methods return a new object instead of changing the original. Keep that in mind: `df.set_index("name")` on its own line does nothing useful.

## Your task

Implement in `solution.py` (the tests build their own frames, so each function works on what it is given):

1. `make_people()`: a DataFrame with the columns `name`, `age`, `city` and these rows, in this order: Ada, 36, London; Grace, 45, New York; Linus, 28, Helsinki.
2. `ages(df)`: the `age` column as a Series.
3. `shape_info(df)`: a tuple `(number of rows, number of columns, list of column names)`.
4. `first_and_last(df)`: a DataFrame with just the first and the last row.
5. `by_name(df)`: the frame indexed by its `name` column.
6. `row_for(df, name)`: the row of the person called `name` as a dict of the other columns, e.g. `{"age": 36, "city": "London"}`.
7. `average_age(df)`: the mean of the `age` column as a float.
