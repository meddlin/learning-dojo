import pandas as pd


def revenue_by_region(df: pd.DataFrame) -> pd.Series:
    raise NotImplementedError


def region_summary(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def top_rep_by_region(df: pd.DataFrame) -> dict[str, str]:
    raise NotImplementedError


def add_region_share(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def regions_with_at_least(df: pd.DataFrame, n: int) -> list[str]:
    raise NotImplementedError


if __name__ == "__main__":
    df = pd.DataFrame({"region": ["n", "s", "n"], "revenue": [10, 5, 20]})
    print(df.groupby("region")["revenue"].sum())
    print(df.groupby("region").size())
