# JSON files

## Concept

JSON is the lingua franca of APIs and config files. The `json` module converts between JSON text and Python values:

| JSON | Python |
| --- | --- |
| object `{}` | `dict` (keys are always strings) |
| array `[]` | `list` (a tuple is written as an array too) |
| string, number | `str`, `int` / `float` |
| `true` / `false` / `null` | `True` / `False` / `None` |

```python
import json

text = json.dumps({"name": "Ada", "langs": ["en", "fr"]})   # to a string
data = json.loads(text)                                      # from a string

with open("config.json", encoding="utf-8") as f:
    config = json.load(f)                 # from a file

with open("out.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2,          # pretty-printed
              sort_keys=True,             # stable key order, nice for diffs
              ensure_ascii=False)         # write "é", not "\u00e9"
```

Not everything is JSON-serialisable: sets, dates and your own classes raise `TypeError` unless you convert them first (or pass `default=str`). Invalid input raises **`json.JSONDecodeError`**, a subclass of `ValueError` with the line and column of the problem.

A common pattern is **defaults plus overrides**: start from built-in defaults and let a file change only some keys. Missing files are fine; broken files should produce a clear error that names the file.

## Your task

Implement in `solution.py`:

1. `save_pretty(path, data)`: write `data` as JSON with a 2-space indent, sorted keys, non-ASCII characters kept as they are, and a final newline.
2. `load_config(path, defaults)`: a new dict: `defaults` updated with the object in the JSON file at `path`. If the file does not exist, return a copy of `defaults`. If it is not valid JSON, raise `ValueError` whose message is `"<path>: invalid JSON"`, chained from the decoding error. If it is valid JSON but not an object, raise `ValueError("<path>: expected a JSON object")`. `defaults` must not change.
3. `csv_to_json(csv_path, json_path, numeric)`: convert a CSV file into a JSON array of objects (one per row, keys from the header). Columns named in `numeric` become numbers: `int` when the value is whole (`"3"`, `"3.0"`), otherwise `float`; empty values in those columns become `null`. Other columns stay strings. Return the number of records.
