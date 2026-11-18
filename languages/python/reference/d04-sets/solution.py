from typing import Iterable


def has_duplicates(items: Iterable) -> bool:
    items = list(items)
    return len(set(items)) != len(items)


def common(a: Iterable, b: Iterable) -> set:
    return set(a) & set(b)


def only_in_first(a: Iterable, b: Iterable) -> set:
    return set(a) - set(b)


def in_exactly_one(a: Iterable, b: Iterable) -> set:
    return set(a) ^ set(b)


def missing_numbers(nums: Iterable[int], n: int) -> list[int]:
    return sorted(set(range(1, n + 1)) - set(nums))


def unique_letters(word: str) -> bool:
    return len(set(word.lower())) == len(word)


def shared_by_all(groups: list[set]) -> set:
    if not groups:
        return set()
    return set.intersection(*groups)


def is_subset(small: Iterable, big: Iterable) -> bool:
    return set(small) <= set(big)


if __name__ == "__main__":
    a = {1, 2, 3}
    b = {2, 3, 4}
    print(a | b, a & b, a - b, a ^ b)
    print(missing_numbers([3, 1, 5], 6))
