# Dates and times

## Concept

Dates in a CSV are text until you parse them. `pd.to_datetime` turns a column into `datetime64`, after which date arithmetic, comparisons and the `.dt` accessor work:

```python
df["ts"] = pd.to_datetime(df["ts"], format="%Y-%m-%d %H:%M")   # explicit format: fast, unambiguous
pd.to_datetime(s, errors="coerce")    # unparseable values become NaT ("not a time") instead of raising

df["ts"].dt.year, df["ts"].dt.month, df["ts"].dt.day_name()
df["ts"].dt.date            # Python date objects
df["ts"].dt.normalize()     # the same timestamps at midnight: compare by day
df["ts"].dt.to_period("M")  # 2024-03 as a monthly period
```

Subtracting timestamps gives **Timedeltas**; `.dt.days` extracts whole days:

```python
(df["shipped"] - df["ordered"]).dt.days
df["ts"] + pd.Timedelta(days=7)
df[df["ts"] >= "2024-03-01"]           # strings are parsed for comparisons
```

**Resampling** groups a time series into regular bins. It needs a datetime index:

```python
df.set_index("ts")["amount"].resample("MS").sum()   # month-start bins; "D" daily, "W" weekly
```

Unlike `groupby` on a month column, `resample` creates every bin in the range, so a month with no events shows up with a total of 0.

Always give `format=` when you know it. Without it, pandas has to guess, and `01/02/2024` is January 2nd in the US but February 1st in most of the world.

## Your task

Implement in `solution.py`:

1. `parse_timestamps(df)`: a new frame whose `timestamp` column (strings like `"2024-01-05 09:30"`) is parsed to datetimes; values that do not match that format become `NaT`.
2. `add_date_parts(df)`: given a frame with a parsed `timestamp` column, a new frame with the extra columns `year`, `month` (numbers) and `weekday` (`"Monday"`...).
3. `count_between(df, start, end)`: how many rows have a `timestamp` whose **day** is from `start` to `end` inclusive (`"YYYY-MM-DD"` strings), as an `int`.
4. `monthly_totals(df)`: a dict `{"YYYY-MM": total amount}` (floats) for every month from the first to the last event, including months without events (0.0). Rows without a timestamp are ignored.
5. `late_orders(df, max_days)`: given a frame with `order_id`, `ordered` and `shipped` date strings (`"YYYY-MM-DD"`), the list of `order_id`s that shipped more than `max_days` days after they were ordered.
