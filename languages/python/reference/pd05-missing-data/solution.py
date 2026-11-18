import numpy as np
import pandas as pd


def missing_counts(df: pd.DataFrame) -> dict[str, int]:
    return {col: int(n) for col, n in df.isna().sum().items()}


def rows_with_missing(df: pd.DataFrame) -> int:
    return int(df.isna().any(axis=1).sum())


def drop_incomplete(df: pd.DataFrame, required: list[str]) -> pd.DataFrame:
    return df.dropna(subset=required)


def fill_defaults(df: pd.DataFrame) -> pd.DataFrame:
    mean_temp = round(df["temp"].mean(), 1)
    return df.fillna({"temp": mean_temp, "humidity": 0, "note": "none"})


def forward_fill_temps(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(temp=df.groupby("sensor")["temp"].ffill())


def dedupe(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates().reset_index(drop=True)


if __name__ == "__main__":
    df = pd.DataFrame({"sensor": ["A", "A", "B"], "temp": [1.0, np.nan, np.nan]})
    print(forward_fill_temps(df))
