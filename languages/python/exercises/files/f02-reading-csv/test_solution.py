import tempfile
from pathlib import Path

from dojo_test import equal, raises
from solution import column_total, find_by, headers, read_records, read_rows

PEOPLE = 'name,city,age,notes\r\n"Smith, Jr.",Boston,42,"said ""hi"""\r\nAda,London,36,\r\nGrace,"New York",45,"line one\nline two"\r\n'
ORDERS = "order_id,product,quantity,price\n1,widget,3,2.50\n2,gadget,1,10.00\n3,widget,2,2.50\n"


def make(tmp, name, text):
    path = Path(tmp) / name
    path.write_bytes(text.encode("utf-8"))
    return path


def test_read_rows_handles_quotes_and_commas():
    with tempfile.TemporaryDirectory() as tmp:
        rows = read_rows(make(tmp, "people.csv", PEOPLE))
        equal(rows[0], ["name", "city", "age", "notes"])
        equal(rows[1], ["Smith, Jr.", "Boston", "42", 'said "hi"'])
        equal(len(rows), 4)


def test_read_rows_keeps_line_breaks_inside_quotes():
    with tempfile.TemporaryDirectory() as tmp:
        rows = read_rows(make(tmp, "people.csv", PEOPLE))
        equal(rows[3], ["Grace", "New York", "45", "line one\nline two"])


def test_read_records():
    with tempfile.TemporaryDirectory() as tmp:
        records = read_records(make(tmp, "people.csv", PEOPLE))
        equal(len(records), 3)
        equal(dict(records[1]), {"name": "Ada", "city": "London", "age": "36", "notes": ""})
        equal(records[0]["name"], "Smith, Jr.")


def test_column_total():
    with tempfile.TemporaryDirectory() as tmp:
        path = make(tmp, "orders.csv", ORDERS)
        equal(column_total(path, "quantity"), 6.0)
        equal(column_total(path, "price"), 15.0)


def test_column_total_of_a_missing_column():
    with tempfile.TemporaryDirectory() as tmp:
        raises(KeyError, column_total, make(tmp, "orders.csv", ORDERS), "discount")


def test_find_by():
    with tempfile.TemporaryDirectory() as tmp:
        path = make(tmp, "orders.csv", ORDERS)
        found = find_by(path, "product", "widget")
        equal([r["order_id"] for r in found], ["1", "3"])
        equal(find_by(path, "product", "Widget"), [])


def test_headers():
    with tempfile.TemporaryDirectory() as tmp:
        equal(headers(make(tmp, "orders.csv", ORDERS)), ["order_id", "product", "quantity", "price"])
        equal(headers(make(tmp, "empty.csv", "")), [])
