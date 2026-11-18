import pandas as pd


def units_wide(df: pd.DataFrame) -> pd.DataFrame:
    return df.pivot_table(index="month", columns="product", values="units", aggfunc="sum", fill_value=0)


def to_long(wide: pd.DataFrame) -> pd.DataFrame:
    long = wide.reset_index().melt(id_vars="month", var_name="product", value_name="units")
    return long.sort_values(["month", "product"]).reset_index(drop=True)


def region_product_counts(df: pd.DataFrame) -> pd.DataFrame:
    return pd.crosstab(df["region"], df["product"])


def best_product_per_month(df: pd.DataFrame) -> dict[str, str]:
    return units_wide(df).idxmax(axis=1).to_dict()


if __name__ == "__main__":
    long = pd.DataFrame({"month": ["01", "01", "02"], "region": ["n", "s", "n"], "product": ["a", "b", "a"], "units": [1, 2, 3]})
    print(units_wide(long))
    print(to_long(units_wide(long)))
