import pandas as pd


def leaderboard(df: pd.DataFrame) -> pd.DataFrame:
    ordered = df.sort_values(["score", "minutes", "name"], ascending=[False, True, True])
    return ordered.reset_index(drop=True)


def top_n_per_class(df: pd.DataFrame, n: int) -> pd.DataFrame:
    ordered = df.sort_values(["cls", "score", "name"], ascending=[True, False, True])
    return ordered.groupby("cls").head(n).reset_index(drop=True)


def add_rank(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(rank=df["score"].rank(method="dense", ascending=False).astype(int))


def class_counts(df: pd.DataFrame) -> dict[str, int]:
    return {cls: int(n) for cls, n in df["cls"].value_counts().items()}


def best_student(df: pd.DataFrame) -> str:
    return df.loc[df["score"].idxmax(), "name"]


if __name__ == "__main__":
    df = pd.DataFrame({"name": ["a", "b"], "cls": ["x", "x"], "score": [1, 2], "minutes": [3, 4]})
    print(leaderboard(df))
