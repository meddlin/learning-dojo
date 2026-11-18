import tempfile
from pathlib import Path

from dojo_test import equal
from solution import append_line, count_lines, list_files, longest_line, replace_in_file, write_lines


def make(tmp, name, text):
    path = Path(tmp) / name
    path.write_text(text, encoding="utf-8")
    return path


def test_count_lines_skips_blank_ones():
    with tempfile.TemporaryDirectory() as tmp:
        equal(count_lines(make(tmp, "a.txt", "one\n\n  \ttwo\n   \nthree")), 3)
        equal(count_lines(make(tmp, "b.txt", "")), 0)


def test_count_lines_accepts_a_string_path():
    with tempfile.TemporaryDirectory() as tmp:
        equal(count_lines(str(make(tmp, "a.txt", "x\ny\n"))), 2)


def test_longest_line():
    with tempfile.TemporaryDirectory() as tmp:
        equal(longest_line(make(tmp, "a.txt", "short\nthe longest one\nmedium line\n")), "the longest one")
        equal(longest_line(make(tmp, "b.txt", "ab\ncd\n")), "ab")
        equal(longest_line(make(tmp, "c.txt", "")), "")


def test_longest_line_reads_utf8():
    with tempfile.TemporaryDirectory() as tmp:
        equal(longest_line(make(tmp, "a.txt", "naïve café\nabc\n")), "naïve café")


def test_write_lines_replaces_the_file():
    with tempfile.TemporaryDirectory() as tmp:
        path = make(tmp, "out.txt", "old content\n")
        write_lines(path, ["alpha", "βeta"])
        equal(path.read_text(encoding="utf-8"), "alpha\nβeta\n")
        write_lines(path, [])
        equal(path.read_text(encoding="utf-8"), "")


def test_append_line_creates_then_appends():
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "log.txt"
        append_line(path, "started")
        append_line(path, "finished")
        equal(path.read_text(encoding="utf-8"), "started\nfinished\n")


def test_list_files():
    with tempfile.TemporaryDirectory() as tmp:
        for name in ["b.csv", "a.csv", "notes.txt", "c.CSV"]:
            make(tmp, name, "x")
        (Path(tmp) / "dir.csv").mkdir()
        equal(list_files(tmp, ".csv"), ["a.csv", "b.csv"])
        equal(list_files(tmp, ".json"), [])


def test_replace_in_file():
    with tempfile.TemporaryDirectory() as tmp:
        path = make(tmp, "a.txt", "cat sat on the cat mat\ncat\n")
        equal(replace_in_file(path, "cat", "dog"), 3)
        equal(path.read_text(encoding="utf-8"), "dog sat on the dog mat\ndog\n")
        equal(replace_in_file(path, "zebra", "x"), 0)
