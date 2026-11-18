import numpy as np
import pandas as pd


def add_total(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(total=(df["quantity"] * df["unit_price"]).round(2))


def add_size(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(size=np.where(df["quantity"] >= 10, "bulk", "single"))


def add_region(df: pd.DataFrame, regions: dict[str, str]) -> pd.DataFrame:
    return df.assign(region=df["country"].map(regions).fillna("Other"))


def clean_products(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(product=df["product"].str.strip().str.title())


def add_price_band(df: pd.DataFrame) -> pd.DataFrame:
    band = pd.cut(df["unit_price"], bins=[0, 5, 15, np.inf], labels=["cheap", "mid", "premium"], right=False)
    return df.assign(band=band)


if __name__ == "__main__":
    df = pd.DataFrame({"quantity": [2, 12], "unit_price": [2.5, 19.99], "product": [" a ", "B"], "country": ["US", "XX"], "order_id": [1, 2]})
    print(add_total(df))
    print(add_price_band(df))
