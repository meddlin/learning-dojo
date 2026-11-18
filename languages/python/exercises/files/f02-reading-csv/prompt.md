# Reading CSV files

## Concept

CSV looks simple enough to parse with `line.split(",")`, until a field contains a comma, a quote or a line break:

```
name,city,notes
"Smith, Jr.",Boston,"said ""hi"""
```

That row has three fields: `Smith, Jr.`, `Boston` and `said "hi"`. The standard **`csv` module** handles quoting, escaping and line endings for you.

```python
import csv

with open("people.csv", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)          # yields each row as a list of strings
    header = next(reader)           # the first row
    for row in reader:
        name, city, notes = row

with open("people.csv", newline="", encoding="utf-8") as f:
    for record in csv.DictReader(f):     # first row becomes the keys
        print(record["name"], record["city"])
```

Two rules to remember:

- open CSV files with **`newline=""`** (the csv module deals with `\r\n` itself; without it, quoted fields with line breaks can be mangled);
- every field is a **string**. Convert explicitly: `int(row["qty"])`, `float(row["price"])`.

Reading row by row keeps memory flat, even for huge files: only materialise a `list(...)` when you need all rows at once.

## Your task

Each function receives the path of a CSV file with a header row. Implement in `solution.py`:

1. `read_rows(path)`: every row (header included) as a list of lists of strings.
2. `read_records(path)`: the data rows as a list of dicts keyed by the header.
3. `column_total(path, column)`: the sum of a numeric column as a `float`. A column that does not exist raises `KeyError`.
4. `find_by(path, column, value)`: the records (dicts) whose `column` equals `value` exactly.
5. `headers(path)`: the list of column names, or `[]` for an empty file.
