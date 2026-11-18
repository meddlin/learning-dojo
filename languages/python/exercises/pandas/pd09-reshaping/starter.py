import pandas as pd


def units_wide(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def to_long(wide: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def region_product_counts(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def best_product_per_month(df: pd.DataFrame) -> dict[str, str]:
    raise NotImplementedError


if __name__ == "__main__":
    long = pd.DataFrame({"month": ["01", "01", "02"], "product": ["a", "b", "a"], "units": [1, 2, 3]})
    wide = long.pivot_table(index="month", columns="product", values="units", aggfunc="sum", fill_value=0)
    print(wide)
