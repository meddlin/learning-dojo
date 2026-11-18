from dojo_test import equal, raises, true
from solution import InsufficientFunds, first_error, parse_age, parse_int, safe_divide, withdraw


def test_parse_int():
    equal(parse_int("42"), 42)
    equal(parse_int("  -7 "), -7)


def test_parse_int_falls_back_to_the_default():
    equal(parse_int("4.2"), None)
    equal(parse_int("forty", 0), 0)
    equal(parse_int("", -1), -1)


def test_safe_divide():
    equal(safe_divide(10, 4), 2.5)
    equal(safe_divide(1, 0), None)


def test_insufficient_funds_carries_data():
    e = InsufficientFunds(50, 20)
    true(isinstance(e, Exception))
    equal(e.needed, 50)
    equal(e.available, 20)
    equal(str(e), "need 50, have 20")


def test_withdraw():
    equal(withdraw(100, 30), 70)
    equal(withdraw(100, 100), 0)


def test_withdraw_rejects_bad_amounts():
    raises(ValueError, withdraw, 100, 0)
    raises(ValueError, withdraw, 100, -5)
    e = raises(InsufficientFunds, withdraw, 20, 50)
    equal((e.needed, e.available), (50, 20))


def test_parse_age():
    equal(parse_age("42"), 42)
    equal(parse_age("0"), 0)
    equal(parse_age("150"), 150)


def test_parse_age_errors():
    e = raises(ValueError, parse_age, "forty")
    equal(str(e), "age must be a whole number")
    true(isinstance(e.__cause__, ValueError), "chain it with `raise ... from e`")
    e = raises(ValueError, parse_age, "151")
    equal(str(e), "age out of range")
    raises(ValueError, parse_age, "-1")


def test_first_error():
    def ok():
        return 1

    def missing_key():
        return {}["x"]

    def bad_index():
        return [][0]

    equal(first_error([ok, missing_key, bad_index]), "KeyError")
    equal(first_error([bad_index, missing_key]), "IndexError")
    equal(first_error([ok, ok]), None)
    equal(first_error([]), None)
