import pandas as pd

from dojo_test import equal, frame_equal
from solution import add_rank, best_student, class_counts, leaderboard, top_n_per_class


def results():
    return pd.DataFrame(
        {
            "name": ["ann", "bo", "cy", "dee", "eve", "fay", "gus"],
            "cls": ["red", "blue", "red", "blue", "red", "blue", "red"],
            "score": [88, 92, 95, 88, 70, 92, 95],
            "minutes": [30, 25, 40, 20, 35, 25, 38],
        }
    )


def test_leaderboard():
    out = leaderboard(results())
    equal(out["name"].tolist(), ["gus", "cy", "bo", "fay", "dee", "ann", "eve"])
    equal(out.index.tolist(), list(range(7)))


def test_top_n_per_class():
    out = top_n_per_class(results(), 2)
    expected = pd.DataFrame(
        {"name": ["bo", "fay", "cy", "gus"], "cls": ["blue", "blue", "red", "red"], "score": [92, 92, 95, 95], "minutes": [25, 25, 40, 38]}
    )
    frame_equal(out, expected)


def test_top_one_per_class():
    equal(top_n_per_class(results(), 1)["name"].tolist(), ["bo", "cy"])


def test_add_rank_dense():
    df = results()
    out = add_rank(df)
    equal(out["rank"].tolist(), [3, 2, 1, 3, 4, 2, 1])
    equal(str(out["rank"].dtype), "int64")
    equal("rank" in df.columns, False, "the input frame must not change")


def test_class_counts():
    equal(class_counts(results()), {"red": 4, "blue": 3})


def test_best_student():
    equal(best_student(results()), "cy")
    equal(best_student(results().iloc[[0, 1, 3]]), "bo")
