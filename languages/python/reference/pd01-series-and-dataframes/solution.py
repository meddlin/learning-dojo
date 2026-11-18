import pandas as pd


def make_people() -> pd.DataFrame:
    return pd.DataFrame(
        {
            "name": ["Ada", "Grace", "Linus"],
            "age": [36, 45, 28],
            "city": ["London", "New York", "Helsinki"],
        }
    )


def ages(df: pd.DataFrame) -> pd.Series:
    return df["age"]


def shape_info(df: pd.DataFrame) -> tuple[int, int, list[str]]:
    rows, cols = df.shape
    return rows, cols, list(df.columns)


def first_and_last(df: pd.DataFrame) -> pd.DataFrame:
    return df.iloc[[0, -1]]


def by_name(df: pd.DataFrame) -> pd.DataFrame:
    return df.set_index("name")


def row_for(df: pd.DataFrame, name: str) -> dict:
    return by_name(df).loc[name].to_dict()


def average_age(df: pd.DataFrame) -> float:
    return float(df["age"].mean())


if __name__ == "__main__":
    df = make_people()
    print(df)
    print(df.dtypes)
    print(row_for(df, "Ada"))
