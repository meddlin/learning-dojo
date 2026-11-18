def rotate(items: list, k: int) -> list:
    if not items:
        return []
    k %= len(items)
    if k == 0:
        return items[:]
    return items[-k:] + items[:-k]


def dedupe(items: list) -> list:
    seen = set()
    out = []
    for item in items:
        if item not in seen:
            seen.add(item)
            out.append(item)
    return out


def flatten(nested: list[list]) -> list:
    return [x for inner in nested for x in inner]


def moving_average(values: list[float], window: int) -> list[float]:
    return [sum(values[i:i + window]) / window for i in range(len(values) - window + 1)]


def make_grid(rows: int, cols: int, fill=0) -> list[list]:
    return [[fill] * cols for _ in range(rows)]


def remove_all(items: list, value) -> None:
    items[:] = [x for x in items if x != value]


if __name__ == "__main__":
    a = [1, 2]
    b = a
    b.append(3)
    print(a, a is b)
    print(rotate([1, 2, 3, 4], 1))
