import pandas as pd


def high_earners(df: pd.DataFrame, threshold: int) -> pd.DataFrame:
    raise NotImplementedError


def in_departments(df: pd.DataFrame, depts: list[str]) -> pd.DataFrame:
    raise NotImplementedError


def engineers_under(df: pd.DataFrame, age: int) -> pd.DataFrame:
    raise NotImplementedError


def names_containing(df: pd.DataFrame, text: str) -> list[str]:
    raise NotImplementedError


def salary_band(df: pd.DataFrame, low: int, high: int) -> pd.DataFrame:
    raise NotImplementedError


def max_salary_in(df: pd.DataFrame, city: str) -> int:
    raise NotImplementedError


if __name__ == "__main__":
    df = pd.DataFrame({"name": ["Ann", "Bob"], "age": [29, 41]})
    mask = df["age"] > 30
    print(mask)
    print(df[mask])
