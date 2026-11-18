import pandas as pd

FORMAT = "%Y-%m-%d %H:%M"


def parse_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(timestamp=pd.to_datetime(df["timestamp"], format=FORMAT, errors="coerce"))


def add_date_parts(df: pd.DataFrame) -> pd.DataFrame:
    ts = df["timestamp"].dt
    return df.assign(year=ts.year, month=ts.month, weekday=ts.day_name())


def count_between(df: pd.DataFrame, start: str, end: str) -> int:
    day = df["timestamp"].dt.normalize()
    return int(day.between(pd.Timestamp(start), pd.Timestamp(end)).sum())


def monthly_totals(df: pd.DataFrame) -> dict[str, float]:
    totals = df.dropna(subset=["timestamp"]).set_index("timestamp")["amount"].resample("MS").sum()
    return {ts.strftime("%Y-%m"): float(v) for ts, v in totals.items()}


def late_orders(df: pd.DataFrame, max_days: int) -> list[int]:
    days = (pd.to_datetime(df["shipped"], format="%Y-%m-%d") - pd.to_datetime(df["ordered"], format="%Y-%m-%d")).dt.days
    return df.loc[days > max_days, "order_id"].tolist()


if __name__ == "__main__":
    df = pd.DataFrame({"timestamp": ["2024-01-05 09:30", "2024-03-01 00:00"], "amount": [10.0, 20.0]})
    print(monthly_totals(parse_timestamps(df)))
