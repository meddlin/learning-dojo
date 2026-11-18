import csv
import tempfile
from pathlib import Path

from dojo_test import equal
from solution import best_seller, monthly_revenue, revenue_by_region, write_summary

SALES = """date,region,product,units,unit_price
2024-01-05,north,widget,10,2.50
2024-01-17,south,gadget,2,19.99
2024-02-02,north,gadget,1,19.99
2024-02-10,east,widget,4,2.50
2024-02-28,south,widget,6,2.50
2024-04-01,north,gizmo,3,7.10
2024-04-15,east,gadget,5,19.99
"""


def make(tmp, text=SALES):
    path = Path(tmp) / "sales.csv"
    path.write_text(text, encoding="utf-8")
    return path


def test_revenue_by_region():
    with tempfile.TemporaryDirectory() as tmp:
        result = revenue_by_region(make(tmp))
        equal(result, {"east": 109.95, "north": 66.29, "south": 54.98})
        equal(list(result), ["east", "north", "south"], "regions in alphabetical order")


def test_best_seller():
    with tempfile.TemporaryDirectory() as tmp:
        equal(best_seller(make(tmp)), ("widget", 20))


def test_best_seller_tie_goes_to_the_first_product():
    with tempfile.TemporaryDirectory() as tmp:
        text = "date,region,product,units,unit_price\n2024-01-01,n,b,2,1\n2024-01-01,n,a,1,1\n2024-01-02,n,a,1,1\n"
        equal(best_seller(make(tmp, text)), ("b", 2))


def test_monthly_revenue():
    with tempfile.TemporaryDirectory() as tmp:
        result = monthly_revenue(make(tmp))
        equal(result, {"2024-01": 64.98, "2024-02": 44.99, "2024-04": 121.25})
        equal(list(result), ["2024-01", "2024-02", "2024-04"])


def test_monthly_revenue_is_chronological_even_if_the_file_is_not():
    with tempfile.TemporaryDirectory() as tmp:
        text = "date,region,product,units,unit_price\n2024-03-01,n,a,1,1\n2023-12-31,n,a,1,2\n"
        equal(list(monthly_revenue(make(tmp, text))), ["2023-12", "2024-03"])


def test_write_summary():
    with tempfile.TemporaryDirectory() as tmp:
        dst = Path(tmp) / "summary.csv"
        write_summary(make(tmp), dst)
        with open(dst, newline="", encoding="utf-8") as f:
            rows = list(csv.reader(f))
        equal(
            rows,
            [
                ["region", "orders", "units", "revenue"],
                ["east", "2", "9", "109.95"],
                ["north", "3", "14", "66.29"],
                ["south", "2", "8", "54.98"],
            ],
        )


def test_write_summary_shows_two_decimals():
    with tempfile.TemporaryDirectory() as tmp:
        dst = Path(tmp) / "summary.csv"
        write_summary(make(tmp, "date,region,product,units,unit_price\n2024-01-01,west,a,3,1.5\n"), dst)
        equal(dst.read_text(encoding="utf-8").splitlines()[1], "west,1,3,4.50")
