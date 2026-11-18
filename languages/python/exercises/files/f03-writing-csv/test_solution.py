import csv
import tempfile
from pathlib import Path

from dojo_test import equal
from solution import filter_csv, to_csv_text, write_records, write_rows


def read_back(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.reader(f))


def test_write_rows():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "out.csv"
        write_rows(path, ["name", "qty"], [["Smith, Jr.", 3], ['say "hi"', 0]])
        equal(read_back(path), [["name", "qty"], ["Smith, Jr.", "3"], ['say "hi"', "0"]])


def test_write_rows_uses_newline_correctly():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "out.csv"
        write_rows(path, ["a"], [["1"], ["2"]])
        equal(path.read_bytes(), b"a\r\n1\r\n2\r\n", "open the file with newline=''")


def test_write_records():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "people.csv"
        records = [
            {"name": "Ada", "email": "ada@example.com", "id": 1},
            {"id": 2, "name": "Grace"},
            {"id": 3, "name": "Linus", "email": "l@example.com", "shoe_size": 44},
        ]
        write_records(path, records, ["id", "name", "email"])
        equal(read_back(path), [["id", "name", "email"], ["1", "Ada", "ada@example.com"], ["2", "Grace", ""], ["3", "Linus", "l@example.com"]])


def test_to_csv_text():
    equal(to_csv_text([["a", "b"], [1, "x,y"]]), 'a,b\n1,"x,y"\n')
    equal(to_csv_text([]), "")


def test_filter_csv():
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "orders.csv"
        dst = Path(tmp) / "big.csv"
        src.write_text("id,customer,amount\n1,ada,5\n2,grace,50\n3,\"Smith, Jr.\",120\n4,linus,9\n", encoding="utf-8")
        n = filter_csv(src, dst, "amount", lambda v: float(v) >= 10)
        equal(n, 2)
        equal(read_back(dst), [["id", "customer", "amount"], ["2", "grace", "50"], ["3", "Smith, Jr.", "120"]])


def test_filter_csv_with_no_matches_still_writes_the_header():
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "orders.csv"
        dst = Path(tmp) / "none.csv"
        src.write_text("id,amount\n1,5\n", encoding="utf-8")
        equal(filter_csv(src, dst, "amount", lambda v: False), 0)
        equal(read_back(dst), [["id", "amount"]])
