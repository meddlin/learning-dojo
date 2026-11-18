import pandas as pd


def load_sales(path) -> pd.DataFrame:
    return pd.read_csv(path, parse_dates=["date"])


def load_european(path) -> pd.DataFrame:
    return pd.read_csv(path, sep=";", decimal=",")


def load_customers(path) -> pd.DataFrame:
    return pd.read_csv(path, usecols=["id", "name", "zip"], dtype={"zip": str}, index_col="id")


def load_scores(path) -> pd.DataFrame:
    return pd.read_csv(path, na_values=["n/a", "-", "missing"])


def load_export(path) -> pd.DataFrame:
    return pd.read_csv(path, comment="#")


def save_csv(df: pd.DataFrame, path) -> None:
    df.to_csv(path, index=False)


if __name__ == "__main__":
    import io

    df = pd.read_csv(io.StringIO("id,zip\n1,02139\n2,10001\n"), dtype={"zip": str})
    print(df.dtypes)
    print(df)
