from typing import Callable


def greet(name, greeting="Hello", *, punctuation="!"):
    raise NotImplementedError


def total(*numbers, start=0):
    raise NotImplementedError


def add_item(item, items=None):
    raise NotImplementedError


def describe(**fields):
    raise NotImplementedError


def make_counter() -> Callable[[], int]:
    raise NotImplementedError


def apply_n(fn, n, x):
    raise NotImplementedError


if __name__ == "__main__":
    print(sorted(["pear", "fig", "banana"], key=len))
    print(greet("Ada"))
