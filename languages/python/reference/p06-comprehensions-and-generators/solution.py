from typing import Iterable, Iterator


def squares_of_evens(numbers: list[int]) -> list[int]:
    return [n * n for n in numbers if n % 2 == 0]


def word_lengths(words: list[str]) -> dict[str, int]:
    return {w: len(w) for w in words}


def invert(d: dict) -> dict:
    return {v: k for k, v in d.items()}


def lengths_used(words: list[str]) -> set[int]:
    return {len(w) for w in words}


def count_long(words: list[str], n: int) -> int:
    return sum(1 for w in words if len(w) > n)


def pairs(xs: list, ys: list) -> list[tuple]:
    return [(x, y) for x in xs for y in ys if x != y]


def chunked(items: Iterable, size: int) -> Iterator[list]:
    if size < 1:
        raise ValueError("size must be at least 1")
    batch = []
    for item in items:
        batch.append(item)
        if len(batch) == size:
            yield batch
            batch = []
    if batch:
        yield batch


def fibonacci() -> Iterator[int]:
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b


if __name__ == "__main__":
    print([n * n for n in range(5)])
    print(list(chunked(range(7), 3)))
