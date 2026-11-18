import csv


def parse_amount(text: str) -> float:
    cleaned = text.strip().replace("$", "").replace(",", "")
    if not cleaned:
        raise ValueError(f"empty amount: {text!r}")
    return round(float(cleaned), 2)


def load_orders(path) -> tuple[list[dict], list[str]]:
    orders: list[dict] = []
    errors: list[str] = []
    seen: set[str] = set()
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        header = [h.strip() for h in next(reader, [])]
        for line_no, row in enumerate(reader, start=2):
            if not any(field.strip() for field in row):
                continue
            if len(row) != len(header):
                errors.append(f"line {line_no}: expected {len(header)} fields, got {len(row)}")
                continue
            record = dict(zip(header, (field.strip() for field in row)))
            order_id = record.get("order_id", "")
            customer = record.get("customer", "")
            amount_text = record.get("amount", "")
            if not customer:
                errors.append(f"line {line_no}: missing customer")
                continue
            try:
                amount = parse_amount(amount_text)
            except ValueError:
                errors.append(f"line {line_no}: bad amount {amount_text!r}")
                continue
            if order_id in seen:
                errors.append(f"line {line_no}: duplicate order_id {order_id}")
                continue
            seen.add(order_id)
            orders.append({"order_id": order_id, "customer": customer.title(), "amount": amount})
    return orders, errors


if __name__ == "__main__":
    print(parse_amount("$1,234.50"))
