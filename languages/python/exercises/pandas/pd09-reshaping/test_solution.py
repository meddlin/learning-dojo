import pandas as pd

from dojo_test import equal, frame_equal
from solution import best_product_per_month, region_product_counts, to_long, units_wide


def sales():
    return pd.DataFrame(
        {
            "month": ["2024-01", "2024-01", "2024-01", "2024-02", "2024-02", "2024-03"],
            "region": ["north", "south", "north", "north", "south", "south"],
            "product": ["widget", "widget", "gadget", "widget", "gizmo", "gadget"],
            "units": [10, 5, 2, 4, 7, 3],
        }
    )


def expected_wide():
    wide = pd.DataFrame(
        {"gadget": [2, 0, 3], "gizmo": [0, 7, 0], "widget": [15, 4, 0]},
        index=pd.Index(["2024-01", "2024-02", "2024-03"], name="month"),
    )
    wide.columns.name = "product"
    return wide


def test_units_wide():
    frame_equal(units_wide(sales()), expected_wide(), check_dtype=False)


def test_to_long():
    expected = pd.DataFrame(
        {
            "month": ["2024-01"] * 3 + ["2024-02"] * 3 + ["2024-03"] * 3,
            "product": ["gadget", "gizmo", "widget"] * 3,
            "units": [2, 0, 15, 0, 7, 4, 3, 0, 0],
        }
    )
    frame_equal(to_long(expected_wide()), expected, check_dtype=False)


def test_region_product_counts():
    counts = region_product_counts(sales())
    equal(counts.loc["north"].to_dict(), {"gadget": 1, "gizmo": 0, "widget": 2})
    equal(counts.loc["south"].to_dict(), {"gadget": 1, "gizmo": 1, "widget": 1})


def test_best_product_per_month():
    equal(best_product_per_month(sales()), {"2024-01": "widget", "2024-02": "gizmo", "2024-03": "gadget"})
