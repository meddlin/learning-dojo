from typing import Iterable


def has_duplicates(items: Iterable) -> bool:
    raise NotImplementedError


def common(a: Iterable, b: Iterable) -> set:
    raise NotImplementedError


def only_in_first(a: Iterable, b: Iterable) -> set:
    raise NotImplementedError


def in_exactly_one(a: Iterable, b: Iterable) -> set:
    raise NotImplementedError


def missing_numbers(nums: Iterable[int], n: int) -> list[int]:
    raise NotImplementedError


def unique_letters(word: str) -> bool:
    raise NotImplementedError


def shared_by_all(groups: list[set]) -> set:
    raise NotImplementedError


def is_subset(small: Iterable, big: Iterable) -> bool:
    raise NotImplementedError


if __name__ == "__main__":
    a = {1, 2, 3}
    b = {2, 3, 4}
    print(a | b, a & b, a - b, a ^ b)
