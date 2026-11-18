import tempfile
from pathlib import Path

import pandas as pd

from dojo_test import equal, frame_equal, true
from solution import load_customers, load_european, load_export, load_sales, load_scores, save_csv


def make(tmp, text, name="data.csv"):
    path = Path(tmp) / name
    path.write_text(text, encoding="utf-8")
    return path


def test_load_sales_parses_dates():
    with tempfile.TemporaryDirectory() as tmp:
        df = load_sales(make(tmp, "date,product,units\n2024-01-05,widget,3\n2024-02-29,gadget,1\n"))
        equal(list(df.columns), ["date", "product", "units"])
        true(pd.api.types.is_datetime64_any_dtype(df["date"]), "date should be a datetime column; use parse_dates")
        equal(df["date"].iloc[1], pd.Timestamp("2024-02-29"))
        equal(df["units"].tolist(), [3, 1])


def test_load_european():
    with tempfile.TemporaryDirectory() as tmp:
        df = load_european(make(tmp, "product;price\nwidget;2,50\ngadget;19,99\n"))
        equal(list(df.columns), ["product", "price"])
        equal(df["price"].tolist(), [2.5, 19.99])


def test_load_customers():
    with tempfile.TemporaryDirectory() as tmp:
        text = "id,name,zip,notes\n7,Ada,02139,likes tea\n9,Grace,10001,\n12,Linus,00501,vip\n"
        df = load_customers(make(tmp, text))
        equal(list(df.columns), ["name", "zip"])
        equal(df.index.name, "id")
        equal(df.index.tolist(), [7, 9, 12])
        equal(df["zip"].tolist(), ["02139", "10001", "00501"])
        equal(df.loc[12, "name"], "Linus")


def test_load_scores_understands_missing_markers():
    with tempfile.TemporaryDirectory() as tmp:
        df = load_scores(make(tmp, "student,score\nann,90\nbo,n/a\ncy,-\ndee,\neve,missing\nfay,72.5\n"))
        true(pd.api.types.is_numeric_dtype(df["score"]), "score should be numeric")
        equal(df["score"].isna().tolist(), [False, True, True, True, True, False])
        equal(df["score"].sum(), 162.5)


def test_load_export_skips_comments():
    with tempfile.TemporaryDirectory() as tmp:
        text = "# exported 2024-03-01\n# source: shop\nsku,qty\nA1,3\nB2,5\n"
        frame_equal(load_export(make(tmp, text)), pd.DataFrame({"sku": ["A1", "B2"], "qty": [3, 5]}))


def test_save_csv_without_index():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "out.csv"
        df = pd.DataFrame({"name": ["Ada", "Smith, Jr."], "score": [90, 85]}, index=[10, 20])
        save_csv(df, path)
        equal(path.read_text(encoding="utf-8").splitlines(), ["name,score", "Ada,90", '"Smith, Jr.",85'])
