import pandas as pd


def orders_with_customers(orders: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


def customers_without_orders(customers: pd.DataFrame, orders: pd.DataFrame) -> list[str]:
    raise NotImplementedError


def unknown_customer_orders(orders: pd.DataFrame, customers: pd.DataFrame) -> list[int]:
    raise NotImplementedError


def revenue_by_city(orders: pd.DataFrame, customers: pd.DataFrame) -> dict[str, float]:
    raise NotImplementedError


def stack_months(jan: pd.DataFrame, feb: pd.DataFrame) -> pd.DataFrame:
    raise NotImplementedError


if __name__ == "__main__":
    a = pd.DataFrame({"k": [1, 2], "x": ["a", "b"]})
    b = pd.DataFrame({"k": [2, 3], "y": ["B", "C"]})
    print(a.merge(b, on="k", how="outer", indicator=True))
