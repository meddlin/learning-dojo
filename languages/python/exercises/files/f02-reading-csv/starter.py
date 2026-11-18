import csv


def read_rows(path) -> list[list[str]]:
    raise NotImplementedError


def read_records(path) -> list[dict[str, str]]:
    raise NotImplementedError


def column_total(path, column: str) -> float:
    raise NotImplementedError


def find_by(path, column: str, value: str) -> list[dict[str, str]]:
    raise NotImplementedError


def headers(path) -> list[str]:
    raise NotImplementedError


if __name__ == "__main__":
    import io

    sample = 'name,city\n"Smith, Jr.",Boston\n'
    print("split:", sample.splitlines()[1].split(","))
    print("csv:  ", list(csv.reader(io.StringIO(sample)))[1])
