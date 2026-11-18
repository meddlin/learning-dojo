import csv
from collections import defaultdict
from datetime import datetime


def _rows(path):
    """(date, region, product, units, revenue) for each row, with numbers converted."""
    with open(path, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            units = int(row["units"])
            yield row["date"], row["region"], row["product"], units, units * float(row["unit_price"])


def revenue_by_region(path) -> dict[str, float]:
    totals: defaultdict[str, float] = defaultdict(float)
    for _, region, _, _, revenue in _rows(path):
        totals[region] += revenue
    return {region: round(total, 2) for region, total in sorted(totals.items())}


def best_seller(path) -> tuple[str, int]:
    units: defaultdict[str, int] = defaultdict(int)
    for _, _, product, n, _ in _rows(path):
        units[product] += n
    return max(units.items(), key=lambda kv: kv[1])


def monthly_revenue(path) -> dict[str, float]:
    totals: defaultdict[str, float] = defaultdict(float)
    for date, _, _, _, revenue in _rows(path):
        month = datetime.strptime(date, "%Y-%m-%d").strftime("%Y-%m")
        totals[month] += revenue
    return {month: round(total, 2) for month, total in sorted(totals.items())}


def write_summary(src, dst) -> None:
    stats: dict[str, list] = {}
    for _, region, _, units, revenue in _rows(src):
        s = stats.setdefault(region, [0, 0, 0.0])
        s[0] += 1
        s[1] += units
        s[2] += revenue
    ordered = sorted(stats.items(), key=lambda kv: (-round(kv[1][2], 2), kv[0]))
    with open(dst, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["region", "orders", "units", "revenue"])
        for region, (orders, units, revenue) in ordered:
            writer.writerow([region, orders, units, f"{revenue:.2f}"])


if __name__ == "__main__":
    import tempfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "sales.csv"
        path.write_text("date,region,product,units,unit_price\n2024-01-05,north,widget,10,2.50\n", encoding="utf-8")
        print(revenue_by_region(path), best_seller(path), monthly_revenue(path))
