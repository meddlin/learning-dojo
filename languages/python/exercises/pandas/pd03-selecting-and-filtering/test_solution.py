import pandas as pd

from dojo_test import equal, frame_equal
from solution import engineers_under, high_earners, in_departments, max_salary_in, names_containing, salary_band


def employees():
    return pd.DataFrame(
        {
            "name": ["Ann", "Bob", "Cyan", "Dee", "Eve", "Fay"],
            "dept": ["Engineering", "Sales", "Engineering", "Marketing", "Engineering", "Sales"],
            "salary": [120_000, 70_000, 95_000, 80_000, 130_000, 65_000],
            "age": [29, 41, 35, 26, 45, 23],
            "city": ["Austin", "Boston", "Austin", "Denver", "Boston", "Denver"],
        }
    )


def test_high_earners():
    df = employees()
    frame_equal(high_earners(df, 100_000), df.loc[[0, 4]])
    frame_equal(high_earners(df, 120_000), df.loc[[4]])
    equal(len(high_earners(df, 200_000)), 0)


def test_in_departments():
    df = employees()
    frame_equal(in_departments(df, ["Sales", "Marketing"]), df.loc[[1, 3, 5]])
    equal(len(in_departments(df, [])), 0)


def test_engineers_under():
    expected = pd.DataFrame({"name": ["Ann", "Cyan"], "age": [29, 35]})
    frame_equal(engineers_under(employees(), 40), expected)
    frame_equal(engineers_under(employees(), 30), expected.head(1))


def test_names_containing():
    equal(names_containing(employees(), "an"), ["Ann", "Cyan"])
    equal(names_containing(employees(), "E"), ["Dee", "Eve"])
    equal(names_containing(employees(), "zz"), [])


def test_salary_band_is_inclusive():
    df = employees()
    frame_equal(salary_band(df, 70_000, 95_000), df.loc[[1, 2, 3], ["name", "salary"]])


def test_max_salary_in():
    equal(max_salary_in(employees(), "Austin"), 120_000)
    equal(max_salary_in(employees(), "Denver"), 80_000)
    equal(type(max_salary_in(employees(), "Boston")), int)
