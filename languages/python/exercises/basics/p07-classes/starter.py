import math
from dataclasses import dataclass


class BankAccount:
    def __init__(self, owner: str, balance: int = 0):
        raise NotImplementedError

    @property
    def balance(self) -> int:
        raise NotImplementedError

    def deposit(self, amount: int) -> None:
        raise NotImplementedError

    def withdraw(self, amount: int) -> None:
        raise NotImplementedError

    def __repr__(self) -> str:
        raise NotImplementedError


@dataclass(frozen=True)
class Vector:
    x: float
    y: float

    def __add__(self, other: "Vector") -> "Vector":
        raise NotImplementedError

    def __mul__(self, k: float) -> "Vector":
        raise NotImplementedError

    def length(self) -> float:
        raise NotImplementedError

    @classmethod
    def from_tuple(cls, pair: tuple[float, float]) -> "Vector":
        raise NotImplementedError


if __name__ == "__main__":
    print(Vector(1, 2))
