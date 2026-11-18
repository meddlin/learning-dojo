import pandas as pd

from dojo_test import equal, frame_equal
from solution import add_price_band, add_region, add_size, add_total, clean_products


def orders():
    return pd.DataFrame(
        {
            "order_id": [1, 2, 3, 4],
            "product": [" widget ", "GADGET", "gizmo  ", "Widget"],
            "quantity": [12, 1, 5, 30],
            "unit_price": [2.5, 19.99, 7.1, 5.0],
            "country": ["US", "DE", "FR", "JP"],
        }
    )


def check_untouched(df):
    frame_equal(df, orders(), "the input frame must not change")


def test_add_total():
    df = orders()
    out = add_total(df)
    equal(list(out.columns), ["order_id", "product", "quantity", "unit_price", "country", "total"])
    equal(out["total"].tolist(), [30.0, 19.99, 35.5, 150.0])
    check_untouched(df)


def test_add_size():
    df = orders()
    out = add_size(df)
    equal(out["size"].tolist(), ["bulk", "single", "single", "bulk"])
    equal(out["order_id"].tolist(), [1, 2, 3, 4])
    check_untouched(df)


def test_add_region():
    df = orders()
    out = add_region(df, {"US": "Americas", "DE": "Europe", "FR": "Europe"})
    equal(out["region"].tolist(), ["Americas", "Europe", "Europe", "Other"])
    check_untouched(df)


def test_clean_products():
    df = orders()
    out = clean_products(df)
    equal(out["product"].tolist(), ["Widget", "Gadget", "Gizmo", "Widget"])
    equal(list(out.columns), list(df.columns))
    check_untouched(df)


def test_add_price_band():
    df = orders()
    out = add_price_band(df)
    equal(out["band"].astype(str).tolist(), ["cheap", "premium", "mid", "mid"])
    check_untouched(df)


def test_add_price_band_edges():
    df = pd.DataFrame({"order_id": [1, 2, 3], "product": ["a"] * 3, "quantity": [1] * 3, "unit_price": [0.0, 14.99, 15.0], "country": ["US"] * 3})
    equal(add_price_band(df)["band"].astype(str).tolist(), ["cheap", "mid", "premium"])
