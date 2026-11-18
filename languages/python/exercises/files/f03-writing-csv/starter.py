import csv
import io
from typing import Callable


def write_rows(path, header: list[str], rows: list[list]) -> None:
    raise NotImplementedError


def write_records(path, records: list[dict], fieldnames: list[str]) -> None:
    raise NotImplementedError


def to_csv_text(rows: list[list]) -> str:
    raise NotImplementedError


def filter_csv(src, dst, column: str, keep: Callable[[str], bool]) -> int:
    raise NotImplementedError


if __name__ == "__main__":
    buf = io.StringIO()
    csv.writer(buf, lineterminator="\n").writerow(["Smith, Jr.", 'said "hi"', 3])
    print(buf.getvalue())
