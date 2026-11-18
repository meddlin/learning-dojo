import json
import tempfile
from pathlib import Path

from dojo_test import equal, raises, true
from solution import csv_to_json, load_config, save_pretty

DEFAULTS = {"theme": "light", "font_size": 14, "plugins": []}


def test_save_pretty():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "out.json"
        save_pretty(path, {"name": "Zoë", "age": 3, "tags": ["a"]})
        equal(path.read_text(encoding="utf-8"), '{\n  "age": 3,\n  "name": "Zoë",\n  "tags": [\n    "a"\n  ]\n}\n')


def test_load_config_overrides_defaults():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "config.json"
        path.write_text('{"theme": "dark", "extra": true}', encoding="utf-8")
        equal(load_config(path, DEFAULTS), {"theme": "dark", "font_size": 14, "plugins": [], "extra": True})
        equal(DEFAULTS, {"theme": "light", "font_size": 14, "plugins": []}, "defaults must not change")


def test_load_config_without_a_file():
    with tempfile.TemporaryDirectory() as tmp:
        config = load_config(Path(tmp) / "missing.json", DEFAULTS)
        equal(config, DEFAULTS)
        true(config is not DEFAULTS, "return a copy")


def test_load_config_with_broken_json():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "config.json"
        path.write_text('{"theme": "dark",}', encoding="utf-8")
        e = raises(ValueError, load_config, path, DEFAULTS)
        equal(str(e), f"{path}: invalid JSON")
        true(isinstance(e.__cause__, json.JSONDecodeError), "chain it with `raise ... from e`")


def test_load_config_with_the_wrong_shape():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "config.json"
        path.write_text("[1, 2]", encoding="utf-8")
        e = raises(ValueError, load_config, path, DEFAULTS)
        equal(str(e), f"{path}: expected a JSON object")


def test_csv_to_json():
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "items.csv"
        dst = Path(tmp) / "items.json"
        src.write_text("sku,name,qty,price,zip\nA1,Widget,3,2.5,02139\nB2,\"Gadget, large\",10,4.0,\nC3,Gizmo,,0.75,10001\n", encoding="utf-8")
        equal(csv_to_json(src, dst, ["qty", "price"]), 3)
        equal(
            json.loads(dst.read_text(encoding="utf-8")),
            [
                {"sku": "A1", "name": "Widget", "qty": 3, "price": 2.5, "zip": "02139"},
                {"sku": "B2", "name": "Gadget, large", "qty": 10, "price": 4, "zip": ""},
                {"sku": "C3", "name": "Gizmo", "qty": None, "price": 0.75, "zip": "10001"},
            ],
        )
