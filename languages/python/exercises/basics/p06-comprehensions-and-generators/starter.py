from typing import Iterable, Iterator


def squares_of_evens(numbers: list[int]) -> list[int]:
    raise NotImplementedError


def word_lengths(words: list[str]) -> dict[str, int]:
    raise NotImplementedError


def invert(d: dict) -> dict:
    raise NotImplementedError


def lengths_used(words: list[str]) -> set[int]:
    raise NotImplementedError


def count_long(words: list[str], n: int) -> int:
    raise NotImplementedError


def pairs(xs: list, ys: list) -> list[tuple]:
    raise NotImplementedError


def chunked(items: Iterable, size: int) -> Iterator[list]:
    # Use yield, so this is a generator.
    raise NotImplementedError


def fibonacci() -> Iterator[int]:
    raise NotImplementedError


if __name__ == "__main__":
    print([n * n for n in range(5)])
    print(squares_of_evens([1, 2, 3, 4]))
