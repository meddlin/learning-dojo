import tempfile
from pathlib import Path

from dojo_test import equal, raises
from solution import load_orders, parse_amount

MESSY = (
    "﻿ order_id , customer ,amount \n"
    "1, ada lovelace ,$1,234.50\n"
    "6,ada lovelace,\"$1,234.50\"\n"
    "2,GRACE HOPPER, 99 \n"
    "\n"
    "3,,10\n"
    "4,linus torvalds,abc\n"
    " , , \n"
    "2,someone else,5\n"
    "5,  margaret hamilton,\"$2,000\"\n"
)


def make(tmp, text):
    path = Path(tmp) / "orders.csv"
    path.write_bytes(text.encode("utf-8"))
    return path


def test_parse_amount():
    equal(parse_amount("12"), 12.0)
    equal(parse_amount(" $1,234.50 "), 1234.5)
    equal(parse_amount("-3.456"), -3.46)
    equal(parse_amount("0"), 0.0)


def test_parse_amount_rejects_junk():
    raises(ValueError, parse_amount, "")
    raises(ValueError, parse_amount, "   ")
    raises(ValueError, parse_amount, "twelve")
    raises(ValueError, parse_amount, "$")


def test_load_orders_clean_file():
    with tempfile.TemporaryDirectory() as tmp:
        orders, errors = load_orders(make(tmp, "order_id,customer,amount\n1,Ada,5\n"))
        equal(orders, [{"order_id": "1", "customer": "Ada", "amount": 5.0}])
        equal(errors, [])


def test_load_orders_handles_bom_whitespace_and_case():
    with tempfile.TemporaryDirectory() as tmp:
        orders, _ = load_orders(make(tmp, "﻿order_id,customer,amount\n 7 ,  ADA lovelace , 12.5 \n"))
        equal(orders, [{"order_id": "7", "customer": "Ada Lovelace", "amount": 12.5}])


def test_load_orders_keeps_the_good_rows():
    with tempfile.TemporaryDirectory() as tmp:
        orders, _ = load_orders(make(tmp, MESSY))
        equal(
            orders,
            [
                {"order_id": "6", "customer": "Ada Lovelace", "amount": 1234.5},
                {"order_id": "2", "customer": "Grace Hopper", "amount": 99.0},
                {"order_id": "5", "customer": "Margaret Hamilton", "amount": 2000.0},
            ],
        )


def test_load_orders_reports_problems_with_line_numbers():
    with tempfile.TemporaryDirectory() as tmp:
        _, errors = load_orders(make(tmp, MESSY))
        equal(
            errors,
            [
                "line 2: expected 3 fields, got 4",
                "line 6: missing customer",
                "line 7: bad amount 'abc'",
                "line 9: duplicate order_id 2",
            ],
        )
