from dojo_test import equal
from solution import average, digit_sum, fahrenheit_label, format_money, split_bill


def test_split_bill_evenly():
    equal(split_bill(900, 3), (300, 0))


def test_split_bill_with_leftover():
    equal(split_bill(1000, 3), (333, 1))
    equal(split_bill(5, 7), (0, 5))


def test_average_is_always_a_float():
    equal(average(2, 2, 2), 2.0)
    equal(average(1, 2, 3), 2.0)


def test_average_of_uneven_numbers():
    equal(round(average(1, 2, 2), 6), 1.666667)


def test_fahrenheit_label():
    equal(fahrenheit_label(21.5), "21.5°C is 70.7°F")
    equal(fahrenheit_label(100), "100.0°C is 212.0°F")
    equal(fahrenheit_label(-40), "-40.0°C is -40.0°F")


def test_digit_sum():
    equal(digit_sum(123), 6)
    equal(digit_sum(0), 0)
    equal(digit_sum(-123), 6)


def test_digit_sum_of_a_huge_number():
    equal(digit_sum(2 ** 100), 115)


def test_format_money():
    equal(format_money(123456), "$1,234.56")
    equal(format_money(5), "$0.05")
    equal(format_money(100), "$1.00")


def test_format_money_negative_and_large():
    equal(format_money(-500), "-$5.00")
    equal(format_money(123456789012), "$1,234,567,890.12")
