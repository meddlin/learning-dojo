# Adding exercises

Each language has its own catalogue under `languages/<id>/` (`cpp`, `go`, `python`):

```
languages/<id>/
  exercises/tracks.json            track order, titles and blurbs
  exercises/<track>/<id>/          one folder per exercise
  reference/<id>/solution.<ext>    the reference solution
  include/                         shared test helpers (dojo.h, dojo_test.go, dojo_test.py + dojo_runner.py)
```

Exercises appear in folder-name order, so prefix ids with a number (`g12-...`). Ids repeat across languages on purpose (both have `g01-adjacency-list`); progress and the learner's files are kept apart per language.

Each exercise folder holds:

| File | Purpose |
| --- | --- |
| `exercise.json` | `title`, `summary`, `concepts[]`, `minutes`, `hints[]` (at least 3, from nudge to near-answer). |
| `prompt.md` | The statement. Starts with `# Title`; the panel hides that first line. Fence code with ` ```cpp `, ` ```go ` or ` ```python ` for highlighting. |
| `starter.cpp` / `starter.go` / `starter.py` | What the learner begins with: signatures and `TODO`s. It must **fail** the tests, and have a scratch `main`. |
| `test.cpp` / `solution_test.go` / `test_solution.py` | The tests (see below). |

The reference solution must **pass** every test and its `main` must exit 0.

## C++

`test.cpp` includes `dojo.h`, then `solution.cpp`, then declares `TEST(...)` cases:

```cpp
#include "dojo.h"
#include "solution.cpp"

TEST(adds_small_numbers) {
  CHECK_EQ(add(2, 3), 5);
}
```

## Go

`solution_test.go` is `package main`, uses the helpers from `include/dojo_test.go` (`Equal`, `True`, `False`, `Near`) and has plain `TestXxx` functions. The runner compiles your `solution.go`, the exercise's `solution_test.go` and `dojo_test.go` together in a throw-away module:

```go
package main

import "testing"

func TestAddsSmallNumbers(t *testing.T) {
	Equal(t, Add(2, 3), 5)
}
```

Only use language features up to Go 1.22: `npm run verify` pins the module's language version to it.

## Python

`test_solution.py` imports the names it needs from `solution` (explicitly, so a renamed function gives a clear message) and the helpers from `dojo_test` (`equal`, `true`, `false`, `near`, `raises`, and `frame_equal` / `series_equal` for pandas), and has top-level `test_*` functions, which run in source order:

```python
from dojo_test import equal, raises
from solution import add


def test_adds_small_numbers():
    equal(add(2, 3), 5)
```

`equal` checks types as well as values (`2` is not `2.0`), but treats NumPy numbers as the Python numbers they hold. Starter functions `raise NotImplementedError`, which the runner reports as "not written yet". The scratch `main` is an `if __name__ == "__main__":` block; the reference's must run cleanly, so write any files it needs into a `tempfile.TemporaryDirectory()`, never next to the solution. Tests that need files do the same.

`include/dojo_runner.py` runs the tests. It prints one event per test on stdout (prefixed with `\x1edojo `), sends everything the learner prints to stderr, and reports syntax and import errors as `path:line:col: error: message` so the extension can underline them.

Stick to Python 3.10 features, and to pandas APIs that behave the same in pandas 2 and 3 (pandas 3 infers a `str` dtype where pandas 2 used `object`; build expected frames with the same constructors, or compare `.tolist()`). Verify with both if you can: `PYTHON=/path/to/python npm run verify -- --lang python`.

## Checking your work

Run `npm run verify` (or `npm run verify -- --lang go f0`) after every change. It builds each exercise, checks that the starter fails and the reference passes, and reports any exercise that breaks either rule.

Tips: name tests as sentences (`adds_small_numbers`, `TestAddsSmallNumbers`; both are shown with spaces); keep each test about one behaviour; make failure messages explain *what* was expected.
