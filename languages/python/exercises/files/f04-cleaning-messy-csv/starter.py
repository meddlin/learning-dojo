import csv


def parse_amount(text: str) -> float:
    raise NotImplementedError


def load_orders(path) -> tuple[list[dict], list[str]]:
    raise NotImplementedError


if __name__ == "__main__":
    print(repr("﻿order_id"), repr("﻿order_id".encode("utf-8")))
