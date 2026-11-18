import csv


def read_rows(path) -> list[list[str]]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.reader(f))


def read_records(path) -> list[dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def column_total(path, column: str) -> float:
    with open(path, newline="", encoding="utf-8") as f:
        return sum(float(row[column]) for row in csv.DictReader(f))


def find_by(path, column: str, value: str) -> list[dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as f:
        return [row for row in csv.DictReader(f) if row[column] == value]


def headers(path) -> list[str]:
    with open(path, newline="", encoding="utf-8") as f:
        return next(csv.reader(f), [])


if __name__ == "__main__":
    import io

    sample = 'name,city\n"Smith, Jr.",Boston\n'
    print("split:", sample.splitlines()[1].split(","))
    print("csv:  ", list(csv.reader(io.StringIO(sample)))[1])
