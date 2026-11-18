def split_bill(total_cents: int, people: int) -> tuple[int, int]:
    """Whole cents per person, and the cents left over."""
    raise NotImplementedError


def average(a: float, b: float, c: float) -> float:
    """The mean of a, b and c, always a float."""
    raise NotImplementedError


def fahrenheit_label(celsius: float) -> str:
    """'21.5°C is 70.7°F': both values with one decimal."""
    raise NotImplementedError


def digit_sum(n: int) -> int:
    """Sum of the decimal digits of n, ignoring its sign."""
    raise NotImplementedError


def format_money(cents: int) -> str:
    """123456 -> '$1,234.56', -500 -> '-$5.00'."""
    raise NotImplementedError


if __name__ == "__main__":
    # Scratch space: press Run to try things out.
    print(7 / 2, 7 // 2, 7 % 2, -7 // 2)
    print(2 ** 100)
    print(split_bill(1000, 3))
