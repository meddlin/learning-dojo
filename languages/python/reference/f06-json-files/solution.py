import csv
import json
from pathlib import Path


def save_pretty(path, data) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write("\n")


def load_config(path, defaults: dict) -> dict:
    config = dict(defaults)
    try:
        with open(path, encoding="utf-8") as f:
            loaded = json.load(f)
    except FileNotFoundError:
        return config
    except json.JSONDecodeError as e:
        raise ValueError(f"{path}: invalid JSON") from e
    if not isinstance(loaded, dict):
        raise ValueError(f"{path}: expected a JSON object")
    config.update(loaded)
    return config


def _number(text: str):
    if not text.strip():
        return None
    value = float(text)
    return int(value) if value.is_integer() else value


def csv_to_json(csv_path, json_path, numeric: list[str]) -> int:
    with open(csv_path, newline="", encoding="utf-8") as f:
        records = list(csv.DictReader(f))
    for record in records:
        for column in numeric:
            record[column] = _number(record[column])
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    return len(records)


if __name__ == "__main__":
    print(json.dumps({"name": "Zoë", "tags": ("a", "b")}, ensure_ascii=False))
