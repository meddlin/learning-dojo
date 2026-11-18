# Writing CSV files

## Concept

```python
import csv

with open("out.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["name", "city"])                 # one row
    writer.writerows([["Ada", "London"], ["Smith, Jr.", "Boston"]])
```

The writer **quotes** fields that need it (`"Smith, Jr."`) and doubles embedded quotes. You never build CSV lines with `",".join(...)` by hand.

`newline=""` matters again: by default the csv writer ends rows with `\r\n`, and on Windows text mode would turn that into `\r\r\n`, which shows up as blank lines between rows in Excel.

**`DictWriter`** writes dicts, in the column order you choose:

```python
with open("out.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "name", "email"],
                            restval="",              # value for missing keys
                            extrasaction="ignore")   # drop keys not in fieldnames
    writer.writeheader()
    writer.writerows(records)
```

Without `extrasaction="ignore"`, a dict with an unexpected key raises `ValueError`.

To get CSV as a string (for tests, an API response, the clipboard), write into an in-memory text file:

```python
import io
buf = io.StringIO()
csv.writer(buf, lineterminator="\n").writerow(["a", "b"])
buf.getvalue()     # 'a,b\n'
```

Reading one file while writing another, row by row, handles files far bigger than memory.

## Your task

Implement in `solution.py`:

1. `write_rows(path, header, rows)`: write the header row and then the rows (lists of values; numbers are fine).
2. `write_records(path, records, fieldnames)`: write dicts with `DictWriter` in `fieldnames` order. Missing keys become empty fields; extra keys are ignored.
3. `to_csv_text(rows)`: the CSV text for a list of rows, with `"\n"` line endings.
4. `filter_csv(src, dst, column, keep)`: copy the header and every row of `src` for which `keep(row[column])` is true into `dst`; return the number of data rows written. `keep` is a function that receives the field as a string.
