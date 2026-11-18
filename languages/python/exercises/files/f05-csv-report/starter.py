import csv
from collections import defaultdict
from datetime import datetime


def revenue_by_region(path) -> dict[str, float]:
    raise NotImplementedError


def best_seller(path) -> tuple[str, int]:
    raise NotImplementedError


def monthly_revenue(path) -> dict[str, float]:
    raise NotImplementedError


def write_summary(src, dst) -> None:
    raise NotImplementedError


if __name__ == "__main__":
    d = datetime.strptime("2024-03-15", "%Y-%m-%d")
    print(d.year, d.month, d.strftime("%Y-%m"))
