from collections import namedtuple

Point = namedtuple("Point", "x y")


def min_max(values: list[int]) -> tuple[int, int]:
    if not values:
        raise ValueError("min_max() of an empty sequence")
    return min(values), max(values)


def head_tail(items: list) -> tuple:
    first, *rest = items
    return first, rest


def parse_point(text: str) -> Point:
    x, y = text.split(",")
    return Point(int(x), int(y))


def transpose(pairs: list[tuple]) -> tuple[tuple, ...]:
    return tuple(zip(*pairs))


def swap_pairs(pairs: list[tuple]) -> list[tuple]:
    return [(b, a) for a, b in pairs]


def rank(records: list[tuple[str, int]]) -> list[tuple[str, int]]:
    return sorted(records, key=lambda r: (-r[1], r[0]))


if __name__ == "__main__":
    first, *rest = [1, 2, 3, 4]
    print(first, rest)
    print(parse_point("3, 4"))
