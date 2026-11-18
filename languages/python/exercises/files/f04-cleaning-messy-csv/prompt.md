# Cleaning a messy CSV

## Concept

CSV exports from spreadsheets and other systems are rarely clean. Typical problems:

- **A byte-order mark (BOM)**: Excel's "CSV UTF-8" starts the file with the invisible character `﻿`, so your first column is called `"﻿order_id"` instead of `"order_id"`. Opening with `encoding="utf-8-sig"` removes it if present and is harmless otherwise.
- **Whitespace** around values and headers: `" Ada "`. Strip everything.
- **Blank lines** in the middle or at the end. `csv.reader` returns them as `[]` (or as rows of empty strings).
- **Inconsistent text**: `"ADA LOVELACE"`, `"ada lovelace"`. Normalise with `.title()`, `.lower()`...
- **Formatted numbers**: `"$1,234.50"`. Remove the decoration before `float()`.
- **Missing or invalid values**, and **duplicate** records.

A good loader does not crash on the first bad row, and does not silently drop data either. It keeps the good rows and collects a **report of problems with line numbers**, so a human can fix the source:

```python
for line_no, row in enumerate(reader, start=2):   # header is line 1
    try:
        amount = parse_amount(row[2])
    except ValueError:
        errors.append(f"line {line_no}: bad amount {row[2]!r}")
        continue
```

## Your task

Implement in `solution.py`:

1. `parse_amount(text)`: turn money text such as `"$1,234.50"`, `" 12 "` or `"-3.5"` into a float rounded to 2 decimals. Raise `ValueError` for empty or invalid text.
2. `load_orders(path)`: read a CSV with the columns `order_id`, `customer`, `amount` (possibly with a BOM, padded headers and padded values) and return a tuple `(orders, errors)`:
   - `orders`: a list of dicts `{"order_id": "7", "customer": "Ada Lovelace", "amount": 12.5}` with stripped strings, the customer in title case and the amount as a float;
   - skip rows that are entirely blank, silently;
   - for other bad rows, skip the row and add one message to `errors`, checking in this order:
     - `"line N: expected 3 fields, got 4"` when the row does not have as many fields as the header (an unquoted `$1,234.50` does this!),
     - `"line N: missing customer"` when the customer is empty,
     - `"line N: bad amount 'abc'"` when `parse_amount` rejects the (stripped) amount,
     - `"line N: duplicate order_id 7"` when the id was already accepted;
   - `N` is the line number in the file, with the header as line 1.
