import numpy as np
import pandas as pd


def missing_counts(df: pd.DataFrame) -> dict[str, int]:
    raise NotImplementedError


def rows_with_missing(df: pd.DataFrame) -> int:
    raise NotImplementedError


def drop_incomplete(df: pd.DataFrame, required: list[str]) -> pd.DataFrame:
    raise NotImplementedError


def fill_defaults(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def forward_fill_temps(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def dedupe(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


if __name__ == "__main__":
    s = pd.Series([1.0, np.nan, 3.0])
    print(s.isna().tolist(), s.mean(), np.nan == np.nan)
