import pandas as pd

from dojo_test import equal, frame_equal
from solution import customers_without_orders, orders_with_customers, revenue_by_city, stack_months, unknown_customer_orders


def customers():
    return pd.DataFrame(
        {
            "customer_id": [1, 2, 3, 4],
            "name": ["Ada", "Grace", "Linus", "Guido"],
            "city": ["London", "New York", "Helsinki", "London"],
        }
    )


def orders():
    return pd.DataFrame(
        {
            "order_id": [103, 101, 102, 104, 105],
            "customer_id": [2, 1, 1, 9, 2],
            "amount": [20.0, 5.5, 4.5, 99.0, 30.0],
        }
    )


def test_orders_with_customers():
    expected = pd.DataFrame(
        {
            "order_id": [101, 102, 103, 105],
            "customer_id": [1, 1, 2, 2],
            "amount": [5.5, 4.5, 20.0, 30.0],
            "name": ["Ada", "Ada", "Grace", "Grace"],
            "city": ["London", "London", "New York", "New York"],
        }
    )
    frame_equal(orders_with_customers(orders(), customers()), expected)


def test_customers_without_orders():
    equal(customers_without_orders(customers(), orders()), ["Linus", "Guido"])
    equal(customers_without_orders(customers(), orders().iloc[0:0]), ["Ada", "Grace", "Linus", "Guido"])


def test_unknown_customer_orders():
    equal(unknown_customer_orders(orders(), customers()), [104])
    extra = pd.concat([orders(), pd.DataFrame({"order_id": [100], "customer_id": [7], "amount": [1.0]})])
    equal(unknown_customer_orders(extra, customers()), [100, 104])


def test_revenue_by_city():
    equal(revenue_by_city(orders(), customers()), {"Helsinki": 0.0, "London": 10.0, "New York": 50.0})


def test_stack_months():
    jan = pd.DataFrame({"item": ["a", "b"], "qty": [1, 2]})
    feb = pd.DataFrame({"item": ["c"], "qty": [3]}, index=[7])
    expected = pd.DataFrame({"item": ["a", "b", "c"], "qty": [1, 2, 3], "month": ["jan", "jan", "feb"]})
    frame_equal(stack_months(jan, feb), expected)
    equal(list(jan.columns), ["item", "qty"], "the inputs must not change")
