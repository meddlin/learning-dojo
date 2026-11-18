"""dojo_test.py: a few tiny assertion helpers shared by every exercise's tests.

You never need to edit it. The runner puts it on the import path next to your
solution.py and the exercise's test_solution.py.

    equal(got, want)              fails the test now if the two values differ
    true(cond) / false(cond)      fails the test now if cond is not true / false
    near(got, want, eps)          float comparison within a tolerance
    raises(ExcType, fn, *args)    fails unless fn(*args) raises ExcType; returns the exception
    frame_equal(got, want)        pandas DataFrames: same columns, index, values and dtypes
    series_equal(got, want)       pandas Series: the same, for one column

Each takes optional trailing context that is printed after a failure:

    equal(word_count(text), {"a": 1}, "text was", text)

`equal` is stricter than `==` in one way that matters while learning: the types
must match, so 2 and 2.0, 1 and True, or [1, 2] and (1, 2) are different answers.
NumPy numbers count as the Python number they hold (numpy.int64(3) equals 3).
"""

from __future__ import annotations

import math
import numbers

__all__ = ["DojoFailure", "equal", "true", "false", "near", "raises", "frame_equal", "series_equal"]

LIMIT = 300


class DojoFailure(AssertionError):
    """Raised by the helpers; the runner prints its message as the reason a test failed."""


def _context(ctx: tuple) -> str:
    return "\ncase: " + " ".join(str(c) for c in ctx) if ctx else ""


def _show(value) -> str:
    text = repr(value)
    if len(text) > LIMIT:
        text = text[:LIMIT] + f"... ({len(text)} chars)"
    return text


def _is_numpy_bool(value) -> bool:
    t = type(value)
    return t.__module__ == "numpy" and t.__name__ in ("bool_", "bool")


def _kind(value):
    """Groups values that should compare as the same type."""
    if isinstance(value, bool) or _is_numpy_bool(value):
        return bool
    if isinstance(value, numbers.Integral):
        return int
    if isinstance(value, numbers.Real) and not isinstance(value, numbers.Integral):
        return float
    if isinstance(value, dict):
        return dict
    return type(value)


def _same(a, b) -> bool:
    ka, kb = _kind(a), _kind(b)
    if ka is not kb:
        return False
    if ka is float:
        return (math.isnan(a) and math.isnan(b)) or a == b
    if ka in (list, tuple):
        return len(a) == len(b) and all(_same(x, y) for x, y in zip(a, b))
    if ka is dict:
        return a.keys() == b.keys() and all(_same(a[k], b[k]) for k in a)
    try:
        result = a == b
        return bool(result)
    except Exception:  # noqa: BLE001 - objects whose == is not a plain bool (arrays, frames)
        return False


def equal(got, want, *ctx) -> None:
    """Fails the test now unless got and want are equal and of the same type."""
    if _same(got, want):
        return
    note = ""
    if _kind(got) is not _kind(want):
        note = f"\n(types differ: {type(got).__name__} vs {type(want).__name__})"
    raise DojoFailure(f"expected: {_show(want)}\n  actual: {_show(got)}{note}{_context(ctx)}")


def true(cond, *ctx) -> None:
    if cond is not True and not (_is_numpy_bool(cond) and bool(cond)):
        raise DojoFailure(f"expected this to be True, got {_show(cond)}{_context(ctx)}")


def false(cond, *ctx) -> None:
    if cond is not False and not (_is_numpy_bool(cond) and not bool(cond)):
        raise DojoFailure(f"expected this to be False, got {_show(cond)}{_context(ctx)}")


def near(got, want, eps: float = 1e-9, *ctx) -> None:
    try:
        ok = abs(got - want) <= eps
    except TypeError:
        ok = False
    if not ok:
        raise DojoFailure(f"expected: {want!r} (+/- {eps})\n  actual: {_show(got)}{_context(ctx)}")


def raises(exc_type, fn, *args, **kwargs):
    """Calls fn(*args, **kwargs) and fails unless it raises exc_type. Returns the exception."""
    try:
        fn(*args, **kwargs)
    except exc_type as e:
        return e
    except NotImplementedError:
        raise
    except Exception as e:  # noqa: BLE001
        name = getattr(fn, "__name__", "the call")
        raise DojoFailure(f"expected {name}() to raise {exc_type.__name__}, but it raised {type(e).__name__}: {e}") from None
    name = getattr(fn, "__name__", "the call")
    raise DojoFailure(f"expected {name}() to raise {exc_type.__name__}, but it returned normally")


def _frame_text(frame) -> str:
    import pandas as pd

    with pd.option_context("display.max_rows", 12, "display.max_columns", 12, "display.width", 120):
        return str(frame)


def _indent(text: str) -> str:
    return "\n".join("    " + line for line in text.splitlines())


def frame_equal(got, want, *ctx, check_dtype: bool = True, check_like: bool = False, **kwargs) -> None:
    """Fails unless two DataFrames match (columns, index, values and, by default, dtypes)."""
    import pandas as pd

    if not isinstance(got, pd.DataFrame):
        raise DojoFailure(f"expected a DataFrame, got {type(got).__name__}: {_show(got)}{_context(ctx)}")
    try:
        pd.testing.assert_frame_equal(got, want, check_dtype=check_dtype, check_like=check_like, **kwargs)
    except AssertionError as e:
        detail = str(e).strip()
        raise DojoFailure(
            f"{detail}\nexpected:\n{_indent(_frame_text(want))}\nactual:\n{_indent(_frame_text(got))}"
            f"\nexpected dtypes: {dict(want.dtypes.astype(str))}\n  actual dtypes: {dict(got.dtypes.astype(str))}{_context(ctx)}"
        ) from None


def series_equal(got, want, *ctx, check_dtype: bool = True, **kwargs) -> None:
    """Fails unless two Series match (name, index, values and, by default, dtype)."""
    import pandas as pd

    if not isinstance(got, pd.Series):
        raise DojoFailure(f"expected a Series, got {type(got).__name__}: {_show(got)}{_context(ctx)}")
    try:
        pd.testing.assert_series_equal(got, want, check_dtype=check_dtype, **kwargs)
    except AssertionError as e:
        detail = str(e).strip()
        raise DojoFailure(f"{detail}\nexpected:\n{_indent(_frame_text(want))}\nactual:\n{_indent(_frame_text(got))}{_context(ctx)}") from None
