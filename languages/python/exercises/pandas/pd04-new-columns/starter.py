import numpy as np
import pandas as pd


def add_total(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def add_size(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def add_region(df: pd.DataFrame, regions: dict[str, str]) -> pd.DataFrame:
    raise NotImplementedError


def clean_products(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def add_price_band(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


if __name__ == "__main__":
    df = pd.DataFrame({"quantity": [2, 12], "unit_price": [2.5, 19.99]})
    print(df.assign(total=df["quantity"] * df["unit_price"]))
    print(df)  # unchanged
