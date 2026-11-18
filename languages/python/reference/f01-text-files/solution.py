from pathlib import Path


def count_lines(path) -> int:
    with open(path, encoding="utf-8") as f:
        return sum(1 for line in f if line.strip())


def longest_line(path) -> str:
    with open(path, encoding="utf-8") as f:
        return max((line.rstrip("\n") for line in f), key=len, default="")


def write_lines(path, lines: list[str]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")


def append_line(path, message: str) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(message + "\n")


def list_files(folder, suffix: str) -> list[str]:
    return sorted(p.name for p in Path(folder).iterdir() if p.is_file() and p.suffix == suffix)


def replace_in_file(path, old: str, new: str) -> int:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    file.write_text(text.replace(old, new), encoding="utf-8")
    return count


if __name__ == "__main__":
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        file = Path(tmp) / "hello.txt"
        write_lines(file, ["one", "", "two"])
        print(count_lines(file), repr(longest_line(file)))
