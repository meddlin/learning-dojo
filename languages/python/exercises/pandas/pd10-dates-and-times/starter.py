import pandas as pd


def parse_timestamps(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def add_date_parts(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def count_between(df: pd.DataFrame, start: str, end: str) -> int:
    raise NotImplementedError


def monthly_totals(df: pd.DataFrame) -> dict[str, float]:
    raise NotImplementedError


def late_orders(df: pd.DataFrame, max_days: int) -> list[int]:
    raise NotImplementedError


if __name__ == "__main__":
    s = pd.to_datetime(pd.Series(["2024-03-01 08:15", "not a date"]), format="%Y-%m-%d %H:%M", errors="coerce")
    print(s)
    print(s.dt.day_name())
