def rotate(items: list, k: int) -> list:
    raise NotImplementedError


def dedupe(items: list) -> list:
    raise NotImplementedError


def flatten(nested: list[list]) -> list:
    raise NotImplementedError


def moving_average(values: list[float], window: int) -> list[float]:
    raise NotImplementedError


def make_grid(rows: int, cols: int, fill=0) -> list[list]:
    raise NotImplementedError


def remove_all(items: list, value) -> None:
    raise NotImplementedError


if __name__ == "__main__":
    a = [1, 2]
    b = a
    b.append(3)
    print(a, a is b)
