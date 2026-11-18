import csv
import json
from pathlib import Path


def save_pretty(path, data) -> None:
    raise NotImplementedError


def load_config(path, defaults: dict) -> dict:
    raise NotImplementedError


def csv_to_json(csv_path, json_path, numeric: list[str]) -> int:
    raise NotImplementedError


if __name__ == "__main__":
    text = json.dumps({"name": "Zoë", "tags": ("a", "b"), "ok": True, "none": None})
    print(text)
    print(json.loads(text))
