import math
from dataclasses import dataclass


class BankAccount:
    def __init__(self, owner: str, balance: int = 0):
        self.owner = owner
        self._balance = balance
        self.history: list[tuple[str, int]] = []

    @property
    def balance(self) -> int:
        return self._balance

    def deposit(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("deposit must be positive")
        self._balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("withdrawal must be positive")
        if amount > self._balance:
            raise ValueError("insufficient funds")
        self._balance -= amount
        self.history.append(("withdraw", amount))

    def __repr__(self) -> str:
        return f"BankAccount({self.owner!r}, {self._balance})"


@dataclass(frozen=True)
class Vector:
    x: float
    y: float

    def __add__(self, other: "Vector") -> "Vector":
        return Vector(self.x + other.x, self.y + other.y)

    def __mul__(self, k: float) -> "Vector":
        return Vector(self.x * k, self.y * k)

    def length(self) -> float:
        return math.hypot(self.x, self.y)

    @classmethod
    def from_tuple(cls, pair: tuple[float, float]) -> "Vector":
        return cls(*pair)


if __name__ == "__main__":
    account = BankAccount("ada")
    account.deposit(50)
    print(account, account.history)
    print(Vector(1, 2) + Vector(3, 4))
