def parse_int(text: str, default=None):
    raise NotImplementedError


def safe_divide(a: float, b: float) -> float | None:
    raise NotImplementedError


class InsufficientFunds(Exception):
    def __init__(self, needed: int, available: int):
        raise NotImplementedError


def withdraw(balance: int, amount: int) -> int:
    raise NotImplementedError


def parse_age(text: str) -> int:
    raise NotImplementedError


def first_error(functions) -> str | None:
    raise NotImplementedError


if __name__ == "__main__":
    try:
        int("twelve")
    except ValueError as e:
        print("caught:", e)
