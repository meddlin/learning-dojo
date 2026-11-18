import pandas as pd


def load_sales(path) -> pd.DataFrame:
    raise NotImplementedError


def load_european(path) -> pd.DataFrame:
    raise NotImplementedError


def load_customers(path) -> pd.DataFrame:
    raise NotImplementedError


def load_scores(path) -> pd.DataFrame:
    raise NotImplementedError


def load_export(path) -> pd.DataFrame:
    raise NotImplementedError


def save_csv(df: pd.DataFrame, path) -> None:
    raise NotImplementedError


if __name__ == "__main__":
    import io

    df = pd.read_csv(io.StringIO("id,zip\n1,02139\n2,10001\n"))
    print(df.dtypes)
    print(df)
