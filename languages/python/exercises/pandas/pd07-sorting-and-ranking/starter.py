import pandas as pd


def leaderboard(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def top_n_per_class(df: pd.DataFrame, n: int) -> pd.DataFrame:
    raise NotImplementedError


def add_rank(df: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def class_counts(df: pd.DataFrame) -> dict[str, int]:
    raise NotImplementedError


def best_student(df: pd.DataFrame) -> str:
    raise NotImplementedError


if __name__ == "__main__":
    s = pd.Series([90, 85, 85, 70])
    print(s.rank(ascending=False, method="min").tolist())
    print(s.rank(ascending=False, method="dense").tolist())
