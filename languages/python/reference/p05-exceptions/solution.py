def parse_int(text: str, default=None):
    try:
        return int(text.strip())
    except ValueError:
        return default


def safe_divide(a: float, b: float) -> float | None:
    try:
        return a / b
    except ZeroDivisionError:
        return None


class InsufficientFunds(Exception):
    def __init__(self, needed: int, available: int):
        super().__init__(f"need {needed}, have {available}")
        self.needed = needed
        self.available = available


def withdraw(balance: int, amount: int) -> int:
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise InsufficientFunds(amount, balance)
    return balance - amount


def parse_age(text: str) -> int:
    try:
        age = int(text)
    except ValueError as e:
        raise ValueError("age must be a whole number") from e
    if not 0 <= age <= 150:
        raise ValueError("age out of range")
    return age


def first_error(functions) -> str | None:
    for fn in functions:
        try:
            fn()
        except Exception as e:
            return type(e).__name__
    return None


if __name__ == "__main__":
    try:
        withdraw(20, 50)
    except InsufficientFunds as e:
        print("caught:", e)
