import pandas as pd


def orders_with_customers(orders: pd.DataFrame, customers: pd.DataFrame) -> pd.DataFrame:
    merged = orders.merge(customers, on="customer_id", how="inner", validate="many_to_one")
    return merged.sort_values("order_id").reset_index(drop=True)


def customers_without_orders(customers: pd.DataFrame, orders: pd.DataFrame) -> list[str]:
    return customers.loc[~customers["customer_id"].isin(orders["customer_id"]), "name"].tolist()


def unknown_customer_orders(orders: pd.DataFrame, customers: pd.DataFrame) -> list[int]:
    merged = orders.merge(customers[["customer_id"]], on="customer_id", how="left", indicator=True)
    return sorted(int(i) for i in merged.loc[merged["_merge"] == "left_only", "order_id"])


def revenue_by_city(orders: pd.DataFrame, customers: pd.DataFrame) -> dict[str, float]:
    merged = customers.merge(orders, on="customer_id", how="left")
    totals = merged.groupby("city")["amount"].sum()
    return {city: float(total) for city, total in totals.items()}


def stack_months(jan: pd.DataFrame, feb: pd.DataFrame) -> pd.DataFrame:
    return pd.concat([jan.assign(month="jan"), feb.assign(month="feb")], ignore_index=True)


if __name__ == "__main__":
    a = pd.DataFrame({"k": [1, 2], "x": ["a", "b"]})
    b = pd.DataFrame({"k": [2, 3], "y": ["B", "C"]})
    print(a.merge(b, on="k", how="outer", indicator=True))
