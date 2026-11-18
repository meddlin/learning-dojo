import pandas as pd


def make_people() -> pd.DataFrame:
    raise NotImplementedError


def ages(df: pd.DataFrame) -> pd.Series:
    raise NotImplementedError


def shape_info(df: pd.DataFrame) -> tuple[int, int, list[str]]:
    raise NotImplementedError


def first_and_last(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def by_name(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def row_for(df: pd.DataFrame, name: str) -> dict:
    raise NotImplementedError


def average_age(df: pd.DataFrame) -> float:
    raise NotImplementedError


if __name__ == "__main__":
    df = pd.DataFrame({"name": ["Ada", "Grace"], "age": [36, 45]})
    print(df)
    print(df.dtypes)
    print(df.iloc[0])
