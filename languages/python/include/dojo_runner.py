"""dojo_runner.py: runs one exercise's tests for Learning Dojo. You never need to run it yourself.

    python -B -u dojo_runner.py --solution DIR --tests FILE [test_name ...]
    python -B -u dojo_runner.py --check FILE

The first form imports DIR/solution.py through the test file and runs its test_*
functions in source order (or only the ones named). Each test runs on its own: an
exception fails that test and the next one still runs. The extension reads results
from stdout, one line per event, prefixed with an ASCII record separator; anything
your code prints goes to stderr instead, so it shows up in the test output without
getting in the way.

The second form only checks FILE for syntax errors.

Errors are reported as `path:line:col: error: message`, the format compilers use,
so the editor can underline them.
"""

from __future__ import annotations

import importlib
import importlib.util
import json
import os
import sys
import time
import traceback

PREFIX = "\x1edojo "
MAX_MESSAGE_LINES = 40

PACKAGE_HELP = (
    "This exercise needs {name}, which is not installed for {exe}.\n"
    "Install it into a virtual environment that Learning Dojo finds by itself:\n"
    "    python3 -m venv ~/.dojo-venv\n"
    "    ~/.dojo-venv/bin/python -m pip install {pip}\n"
    "(on Windows: %USERPROFILE%\\.dojo-venv\\Scripts\\python.exe -m pip install {pip})\n"
    'then run "Dojo: Refresh". To use another environment, set "dojo.python.path" to its python.'
)
PIP_NAMES = {"pandas": "pandas", "numpy": "numpy"}


def _proto():
    """The real stdout, kept for events. fd 1 itself is pointed at stderr so stray prints cannot corrupt it."""
    out = os.fdopen(os.dup(1), "w", encoding="utf-8", buffering=1)
    os.dup2(2, 1)
    sys.stdout = sys.stderr
    return out


def send(proto, event: str, **fields) -> None:
    proto.write(PREFIX + json.dumps({"e": event, **fields}) + "\n")
    proto.flush()


def diagnostic(path: str, line: int, col: int, message: str) -> str:
    first = message.splitlines()[0] if message else "error"
    return f"{path}:{max(1, line or 1)}:{max(1, col or 1)}: error: {first}"


def check_syntax(path: str) -> str | None:
    """Returns a compiler-style message for the first syntax error in path, or None."""
    try:
        with open(path, "rb") as f:
            source = f.read()
        compile(source, path, "exec", dont_inherit=True)
    except SyntaxError as e:
        lines = [diagnostic(path, e.lineno or 1, e.offset or 1, f"{type(e).__name__}: {e.msg}")]
        if e.text:
            lines.append("    " + e.text.rstrip("\n"))
            if e.offset:
                lines.append("    " + " " * (e.offset - 1) + "^")
        return "\n".join(lines)
    except ValueError as e:  # for example a null byte in the source
        return diagnostic(path, 1, 1, f"{type(e).__name__}: {e}")
    return None


def interesting(filename: str, watched: set[str]) -> bool:
    return os.path.basename(filename) in watched


def frames_text(tb, watched: set[str]) -> list[str]:
    """`at solution.py:12 in word_count` lines for frames in the learner's file and the test file."""
    out = []
    for fs in traceback.extract_tb(tb):
        if interesting(fs.filename, watched):
            out.append(f"    at {os.path.basename(fs.filename)}:{fs.lineno} in {fs.name}")
            if fs.line:
                out.append(f"        {fs.line.strip()}")
    return out


def last_frame_in(tb, basename: str):
    found = None
    for fs in traceback.extract_tb(tb):
        if os.path.basename(fs.filename) == basename:
            found = fs
    return found


def describe(exc: BaseException, watched: set[str]) -> str:
    """What a learner should read when a test fails."""
    from dojo_test import DojoFailure

    tb = exc.__traceback__
    lines: list[str] = []
    if isinstance(exc, DojoFailure):
        where = last_frame_in(tb, "test_solution.py")
        if where:
            lines.append(f"    at test_solution.py:{where.lineno}")
        lines += ["    " + l for l in str(exc).splitlines()]
    elif isinstance(exc, NotImplementedError):
        where = last_frame_in(tb, "solution.py")
        name = where.name if where else "a function"
        lines.append(f"    {name}() is not written yet: it still raises NotImplementedError")
    elif isinstance(exc, AssertionError):
        where = last_frame_in(tb, "test_solution.py") or last_frame_in(tb, "solution.py")
        lines.append(f"    assertion failed{': ' + str(exc) if str(exc) else ''}")
        if where:
            lines.append(f"    at {os.path.basename(where.filename)}:{where.lineno}")
            if where.line:
                lines.append(f"        {where.line.strip()}")
    else:
        lines.append(f"    {type(exc).__name__}: {exc}")
        lines += frames_text(tb, watched)
    if len(lines) > MAX_MESSAGE_LINES:
        lines = lines[:MAX_MESSAGE_LINES] + ["    ..."]
    return "\n".join(lines)


def load_failure(exc: BaseException, solution_path: str, watched: set[str]) -> str:
    """The message for an error raised while importing solution.py or the tests."""
    if isinstance(exc, ModuleNotFoundError) and exc.name and exc.name.split(".")[0] in PIP_NAMES:
        top = exc.name.split(".")[0]
        return PACKAGE_HELP.format(name=top, pip=PIP_NAMES[top], exe=sys.executable)
    if isinstance(exc, ImportError) and getattr(exc, "name", None) == "solution" and "cannot import name" in str(exc):
        missing = str(exc).split("'")[1] if "'" in str(exc) else "a name"
        return (
            f"The tests use `{missing}` from solution.py, but solution.py does not define it.\n"
            "Did you rename or delete it? Keep the names and signatures from the starter."
        )
    lines = []
    where = last_frame_in(exc.__traceback__, "solution.py")
    if where:
        col = (getattr(where, "colno", None) or 0) + 1  # colno exists from Python 3.11
        lines.append(diagnostic(solution_path, where.lineno or 1, col, f"{type(exc).__name__}: {exc}"))
    lines.append(f"Importing solution.py failed: {type(exc).__name__}: {exc}")
    lines += frames_text(exc.__traceback__, watched)
    return "\n".join(lines)


def run_tests(solution_dir: str, tests_path: str, wanted: list[str]) -> int:
    proto = _proto()
    include_dir = os.path.dirname(os.path.abspath(__file__))
    solution_path = os.path.join(solution_dir, "solution.py")
    watched = {"solution.py", os.path.basename(tests_path)}
    sys.path[:0] = [solution_dir, include_dir]
    sys.dont_write_bytecode = True

    problem = check_syntax(solution_path)
    if problem:
        print(problem, file=sys.stderr)
        send(proto, "error", message=problem)
        return 2

    try:
        spec = importlib.util.spec_from_file_location("test_solution", tests_path)
        module = importlib.util.module_from_spec(spec)
        sys.modules["test_solution"] = module
        spec.loader.exec_module(module)
    except BaseException as e:  # noqa: BLE001 - SystemExit and friends too: report, never crash
        message = load_failure(e, solution_path, watched)
        print(message, file=sys.stderr)
        send(proto, "error", message=message)
        return 2

    tests = [
        (name, fn)
        for name, fn in vars(module).items()
        if name.startswith("test_") and callable(fn) and getattr(fn, "__module__", None) == "test_solution"
    ]
    if wanted:
        keep = set(wanted)
        tests = [(n, f) for n, f in tests if n in keep]
    send(proto, "start", tests=[n for n, _ in tests])

    failed = 0
    for name, fn in tests:
        send(proto, "run", name=name)
        started = time.perf_counter()
        try:
            fn()
            ok, message = True, ""
        except SystemExit as e:
            ok, message = False, f"    the code called sys.exit({e.code!r}); return a value instead"
        except KeyboardInterrupt:
            raise
        except BaseException as e:  # noqa: BLE001
            ok, message = False, describe(e, watched)
        failed += 0 if ok else 1
        send(proto, "done", name=name, ok=ok, message=message, ms=round((time.perf_counter() - started) * 1000))
    send(proto, "end")
    return 1 if failed else 0


def main(argv: list[str]) -> int:
    if len(argv) >= 2 and argv[0] == "--check":
        problem = check_syntax(argv[1])
        if problem:
            print(problem)
            return 1
        return 0
    try:
        si = argv.index("--solution")
        ti = argv.index("--tests")
    except ValueError:
        print(__doc__, file=sys.stderr)
        return 2
    solution_dir, tests_path = argv[si + 1], argv[ti + 1]
    rest = [a for i, a in enumerate(argv) if i not in (si, si + 1, ti, ti + 1)]
    return run_tests(os.path.abspath(solution_dir), os.path.abspath(tests_path), rest)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
