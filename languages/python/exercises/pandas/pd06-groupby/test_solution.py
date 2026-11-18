import pandas as pd

from dojo_test import equal, frame_equal, series_equal
from solution import add_region_share, region_summary, regions_with_at_least, revenue_by_region, top_rep_by_region


def sales():
    return pd.DataFrame(
        {
            "region": ["north", "south", "north", "east", "south", "north", "east"],
            "rep": ["ann", "bo", "cy", "dee", "bo", "ann", "eve"],
            "product": ["widget", "gadget", "gadget", "widget", "widget", "gizmo", "gadget"],
            "units": [10, 2, 1, 4, 6, 3, 5],
            "revenue": [25.0, 40.0, 20.0, 10.0, 15.0, 21.0, 100.0],
        }
    )


def test_revenue_by_region():
    expected = pd.Series([110.0, 66.0, 55.0], index=pd.Index(["east", "north", "south"], name="region"), name="revenue")
    series_equal(revenue_by_region(sales()), expected)


def test_region_summary():
    expected = pd.DataFrame(
        {
            "region": ["east", "north", "south"],
            "orders": [2, 3, 2],
            "units": [9, 14, 8],
            "avg_revenue": [55.0, 22.0, 27.5],
        }
    )
    frame_equal(region_summary(sales()), expected, check_dtype=False)


def test_top_rep_by_region_uses_totals():
    # In the north, ann has two orders (25 + 21 = 46) and beats cy's single 20.
    equal(top_rep_by_region(sales()), {"east": "eve", "north": "ann", "south": "bo"})


def test_top_rep_by_region_when_a_bigger_single_order_loses():
    df = pd.DataFrame({"region": ["x", "x", "x"], "rep": ["big", "steady", "steady"], "product": ["p"] * 3, "units": [1, 1, 1], "revenue": [50.0, 30.0, 30.0]})
    equal(top_rep_by_region(df), {"x": "steady"})


def test_add_region_share():
    df = sales()
    out = add_region_share(df)
    equal(out["share"].tolist(), [0.379, 0.727, 0.303, 0.091, 0.273, 0.318, 0.909])
    equal(list(df.columns), ["region", "rep", "product", "units", "revenue"], "the input frame must not change")


def test_regions_with_at_least():
    equal(regions_with_at_least(sales(), 3), ["north"])
    equal(regions_with_at_least(sales(), 2), ["east", "north", "south"])
    equal(regions_with_at_least(sales(), 4), [])
