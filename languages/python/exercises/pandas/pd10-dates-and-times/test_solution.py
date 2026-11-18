import pandas as pd

from dojo_test import equal, true
from solution import add_date_parts, count_between, late_orders, monthly_totals, parse_timestamps


def events():
    return pd.DataFrame(
        {
            "timestamp": ["2024-01-05 09:30", "2024-01-31 23:59", "not a date", "2024-03-01 00:00", "2024-03-15 12:00"],
            "user": ["ann", "bo", "cy", "ann", "dee"],
            "amount": [10.0, 5.5, 99.0, 20.0, 4.5],
        }
    )


def parsed():
    df = events()
    df["timestamp"] = pd.to_datetime(df["timestamp"], format="%Y-%m-%d %H:%M", errors="coerce")
    return df


def test_parse_timestamps():
    df = events()
    out = parse_timestamps(df)
    true(pd.api.types.is_datetime64_any_dtype(out["timestamp"]), "timestamp should be a datetime column")
    equal(out["timestamp"].iloc[0], pd.Timestamp("2024-01-05 09:30"))
    equal(out["timestamp"].isna().tolist(), [False, False, True, False, False])
    equal(df["timestamp"].iloc[0], "2024-01-05 09:30", "the input frame must not change")


def test_parse_timestamps_insists_on_the_format():
    df = pd.DataFrame({"timestamp": ["2024-01-05", "05/01/2024 10:00"], "user": ["a", "b"], "amount": [1.0, 2.0]})
    equal(parse_timestamps(df)["timestamp"].isna().tolist(), [True, True])


def test_add_date_parts():
    out = add_date_parts(parsed().dropna())
    equal(out["year"].tolist(), [2024, 2024, 2024, 2024])
    equal(out["month"].tolist(), [1, 1, 3, 3])
    equal(out["weekday"].tolist(), ["Friday", "Wednesday", "Friday", "Friday"])


def test_count_between_is_inclusive_by_day():
    df = parsed()
    equal(count_between(df, "2024-01-05", "2024-01-31"), 2)
    equal(count_between(df, "2024-01-31", "2024-03-01"), 2)
    equal(count_between(df, "2024-02-01", "2024-02-29"), 0)


def test_monthly_totals_include_empty_months():
    equal(monthly_totals(parsed()), {"2024-01": 15.5, "2024-02": 0.0, "2024-03": 24.5})


def test_late_orders():
    df = pd.DataFrame(
        {
            "order_id": [1, 2, 3, 4],
            "ordered": ["2024-01-01", "2024-01-30", "2024-02-27", "2024-03-01"],
            "shipped": ["2024-01-03", "2024-02-05", "2024-03-01", "2024-03-01"],
        }
    )
    equal(late_orders(df, 2), [2, 3])
    equal(late_orders(df, 3), [2])
    equal(late_orders(df, 10), [])
