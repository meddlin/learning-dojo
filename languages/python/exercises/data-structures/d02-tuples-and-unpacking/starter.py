from collections import namedtuple

Point = namedtuple("Point", "x y")


def min_max(values: list[int]) -> tuple[int, int]:
    raise NotImplementedError


def head_tail(items: list) -> tuple:
    raise NotImplementedError


def parse_point(text: str) -> Point:
    raise NotImplementedError


def transpose(pairs: list[tuple]) -> tuple[tuple, ...]:
    raise NotImplementedError


def swap_pairs(pairs: list[tuple]) -> list[tuple]:
    raise NotImplementedError


def rank(records: list[tuple[str, int]]) -> list[tuple[str, int]]:
    raise NotImplementedError


if __name__ == "__main__":
    first, *rest = [1, 2, 3, 4]
    print(first, rest)
    print(Point(3, 4))
