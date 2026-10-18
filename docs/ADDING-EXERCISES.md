# Adding exercises

Each language has its own catalogue under `languages/<id>/` (`cpp`, `go`):

```
languages/<id>/
  exercises/tracks.json            track order, titles and blurbs
  exercises/<track>/<id>/          one folder per exercise
  reference/<id>/solution.<ext>    the reference solution
  include/                         shared test helpers (dojo.h, dojo_test.go)
```

Exercises appear in folder-name order, so prefix ids with a number (`g12-...`). Ids repeat across languages on purpose (both have `g01-adjacency-list`); progress and the learner's files are kept apart per language.

Each exercise folder holds:

| File | Purpose |
| --- | --- |
| `exercise.json` | `title`, `summary`, `concepts[]`, `minutes`, `hints[]` (at least 3, from nudge to near-answer). |
| `prompt.md` | The statement. Starts with `# Title`; the panel hides that first line. Fence code with ` ```cpp ` or ` ```go ` for highlighting. |
| `starter.cpp` / `starter.go` | What the learner begins with: signatures and `TODO`s. It must **fail** the tests, and have a scratch `main`. |
| `test.cpp` / `solution_test.go` | The tests (see below). |

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

## Checking your work

Run `npm run verify` (or `npm run verify -- --lang go f0`) after every change. It builds each exercise, checks that the starter fails and the reference passes, and reports any exercise that breaks either rule.

Tips: name tests as sentences (`adds_small_numbers`, `TestAddsSmallNumbers`; both are shown with spaces); keep each test about one behaviour; make failure messages explain *what* was expected.
