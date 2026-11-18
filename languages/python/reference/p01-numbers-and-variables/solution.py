def split_bill(total_cents: int, people: int) -> tuple[int, int]:
    """Whole cents per person, and the cents left over."""
    return divmod(total_cents, people)


def average(a: float, b: float, c: float) -> float:
    """The mean of a, b and c, always a float."""
    return (a + b + c) / 3


def fahrenheit_label(celsius: float) -> str:
    """'21.5°C is 70.7°F': both values with one decimal."""
    fahrenheit = celsius * 9 / 5 + 32
    return f"{celsius:.1f}°C is {fahrenheit:.1f}°F"


def digit_sum(n: int) -> int:
    """Sum of the decimal digits of n, ignoring its sign."""
    return sum(int(ch) for ch in str(abs(n)))


def format_money(cents: int) -> str:
    """123456 -> '$1,234.56', -500 -> '-$5.00'."""
    dollars, rest = divmod(abs(cents), 100)
    sign = "-" if cents < 0 else ""
    return f"{sign}${dollars:,}.{rest:02d}"


if __name__ == "__main__":
    print(7 / 2, 7 // 2, 7 % 2, -7 // 2)
    print(2 ** 100)
    print(split_bill(1000, 3))
    print(format_money(123456))
