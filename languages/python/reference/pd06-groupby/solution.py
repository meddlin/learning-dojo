import pandas as pd


def revenue_by_region(df: pd.DataFrame) -> pd.Series:
    return df.groupby("region")["revenue"].sum()


def region_summary(df: pd.DataFrame) -> pd.DataFrame:
    summary = df.groupby("region").agg(
        orders=("revenue", "size"),
        units=("units", "sum"),
        avg_revenue=("revenue", "mean"),
    )
    return summary.round({"avg_revenue": 2}).reset_index()


def top_rep_by_region(df: pd.DataFrame) -> dict[str, str]:
    totals = df.groupby(["region", "rep"])["revenue"].sum()
    return {region: rep for region, rep in totals.groupby(level="region").idxmax()}


def add_region_share(df: pd.DataFrame) -> pd.DataFrame:
    totals = df.groupby("region")["revenue"].transform("sum")
    return df.assign(share=(df["revenue"] / totals).round(3))


def regions_with_at_least(df: pd.DataFrame, n: int) -> list[str]:
    sizes = df.groupby("region").size()
    return sizes[sizes >= n].index.tolist()


if __name__ == "__main__":
    df = pd.DataFrame({"region": ["n", "s", "n"], "rep": ["a", "b", "c"], "units": [1, 2, 3], "revenue": [10.0, 5.0, 20.0]})
    print(region_summary(df))
    print(top_rep_by_region(df))
