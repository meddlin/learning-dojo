# Text files

## Concept

Open files with a **`with` block**. It closes the file when the block ends, even if an exception is raised:

```python
with open("notes.txt", encoding="utf-8") as f:   # mode "r" (read) is the default
    for line in f:                              # one line at a time, memory-friendly
        print(line.rstrip("\n"))                # each line keeps its "\n"

with open("notes.txt", encoding="utf-8") as f:
    text = f.read()                             # the whole file as one string
    # f.readlines() would give a list of lines

with open("out.txt", "w", encoding="utf-8") as f:   # "w": create or TRUNCATE
    f.write("first line\n")                     # write adds no newline for you
    print("second line", file=f)                # print does

with open("log.txt", "a", encoding="utf-8") as f:   # "a": append, create if missing
    f.write("another entry\n")
```

Always pass **`encoding="utf-8"`**: the default depends on the operating system (it is not UTF-8 on some Windows set-ups), so code that works on your machine can garble text on another.

**`pathlib`** treats paths as objects and has shortcuts for small files:

```python
from pathlib import Path

folder = Path("data")
file = folder / "report.txt"        # joins with the right separator
file.exists(), file.name, file.stem, file.suffix   # True, 'report.txt', 'report', '.txt'
text = file.read_text(encoding="utf-8")
file.write_text("hello\n", encoding="utf-8")
for p in folder.iterdir(): ...      # everything in the folder
for p in folder.glob("*.csv"): ...  # matching names
```

Every function below receives paths as strings or `Path` objects; `open()` and `Path()` accept both.

## Your task

Implement in `solution.py`:

1. `count_lines(path)`: the number of lines that are not blank (whitespace only counts as blank).
2. `longest_line(path)`: the longest line without its newline; `""` for an empty file. On a tie, the first one.
3. `write_lines(path, lines)`: write each string followed by a newline, replacing any existing content.
4. `append_line(path, message)`: add `message` and a newline to the end of the file, creating it if needed.
5. `list_files(folder, suffix)`: the sorted **names** of the files (not sub-folders) in `folder` whose suffix is `suffix`, e.g. `".csv"`.
6. `replace_in_file(path, old, new)`: replace every occurrence of `old` with `new` in the file, and return how many were replaced.
