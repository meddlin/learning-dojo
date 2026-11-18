import pandas as pd


def high_earners(df: pd.DataFrame, threshold: int) -> pd.DataFrame:
    return df[df["salary"] > threshold]


def in_departments(df: pd.DataFrame, depts: list[str]) -> pd.DataFrame:
    return df[df["dept"].isin(depts)]


def engineers_under(df: pd.DataFrame, age: int) -> pd.DataFrame:
    mask = (df["dept"] == "Engineering") & (df["age"] < age)
    return df.loc[mask, ["name", "age"]].reset_index(drop=True)


def names_containing(df: pd.DataFrame, text: str) -> list[str]:
    return df.loc[df["name"].str.contains(text, case=False, regex=False), "name"].tolist()


def salary_band(df: pd.DataFrame, low: int, high: int) -> pd.DataFrame:
    return df.loc[df["salary"].between(low, high), ["name", "salary"]]


def max_salary_in(df: pd.DataFrame, city: str) -> int:
    return int(df.loc[df["city"] == city, "salary"].max())


if __name__ == "__main__":
    df = pd.DataFrame({"name": ["Ann", "Bob"], "age": [29, 41]})
    print(df[df["age"] > 30])
