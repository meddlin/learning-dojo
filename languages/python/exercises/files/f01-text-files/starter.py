from pathlib import Path


def count_lines(path) -> int:
    raise NotImplementedError


def longest_line(path) -> str:
    raise NotImplementedError


def write_lines(path, lines: list[str]) -> None:
    raise NotImplementedError


def append_line(path, message: str) -> None:
    raise NotImplementedError


def list_files(folder, suffix: str) -> list[str]:
    raise NotImplementedError


def replace_in_file(path, old: str, new: str) -> int:
    raise NotImplementedError


if __name__ == "__main__":
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        file = Path(tmp) / "hello.txt"
        file.write_text("one\n\ntwo\n", encoding="utf-8")
        with open(file, encoding="utf-8") as f:
            for line in f:
                print(repr(line))
