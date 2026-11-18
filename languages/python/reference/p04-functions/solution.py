from typing import Callable


def greet(name, greeting="Hello", *, punctuation="!"):
    return f"{greeting}, {name}{punctuation}"


def total(*numbers, start=0):
    return start + sum(numbers)


def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items


def describe(**fields):
    return ", ".join(f"{key}={value}" for key, value in sorted(fields.items()))


def make_counter() -> Callable[[], int]:
    count = 0

    def step() -> int:
        nonlocal count
        count += 1
        return count

    return step


def apply_n(fn, n, x):
    for _ in range(n):
        x = fn(x)
    return x


if __name__ == "__main__":
    print(sorted(["pear", "fig", "banana"], key=len))
    print(greet("Ada"))
    counter = make_counter()
    print(counter(), counter())
