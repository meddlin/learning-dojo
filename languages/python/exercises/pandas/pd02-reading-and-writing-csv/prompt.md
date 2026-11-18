# Reading and writing CSV with pandas

## Concept

`pd.read_csv` does everything the last track did by hand (quoting, headers, type conversion) in one call, and has an option for most real-world quirks:

```python
df = pd.read_csv(
    "sales.csv",
    parse_dates=["date"],          # turn these columns into datetime64
    sep=";",                       # separator (default ",")
    decimal=",",                   # "2,50" means 2.5 (European exports)
    usecols=["id", "name", "zip"], # only load these columns
    dtype={"zip": str},            # do not guess: keep "02139" as text
    index_col="id",                # use a column as the index
    na_values=["n/a", "-"],        # extra strings that mean "missing"
    comment="#",                   # ignore lines starting with #
    encoding="utf-8",              # "utf-8-sig" strips an Excel BOM
)
df.info()                          # columns, non-null counts, dtypes, memory
```

pandas **guesses dtypes** from the data: a column of digits becomes `int64`, a column with any missing value becomes `float64` (because `NaN` is a float), anything else becomes text. Guessing goes wrong for identifiers like zip codes, phone numbers or product codes with leading zeros: say what you want with `dtype`.

`read_csv` accepts a path, a URL, or any file-like object (`io.StringIO(text)` is handy in experiments).

Writing is `df.to_csv(path, index=False)`. Without `index=False`, the index (0, 1, 2...) is written as an extra unnamed first column, which then comes back as `Unnamed: 0` the next time you read the file.

## Your task

Implement in `solution.py` (each function receives a path):

1. `load_sales(path)`: a CSV with the columns `date,product,units`; `date` must be parsed as dates.
2. `load_european(path)`: a semicolon-separated file that uses a decimal comma (`product;price` / `widget;2,50`); `price` must come back as floats.
3. `load_customers(path)`: a file with the columns `id,name,zip,notes`. Load only `id`, `name` and `zip`, keep `zip` as text (leading zeros intact) and use `id` as the index.
4. `load_scores(path)`: a file with the columns `student,score` where missing scores are written as empty, `n/a`, `-` or `missing`; `score` must be a numeric column with those as missing values (`NaN`).
5. `load_export(path)`: a normal CSV that starts with a few comment lines beginning with `#`.
6. `save_csv(df, path)`: write the frame without its index.
