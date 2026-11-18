import pandas as pd

from dojo_test import equal, frame_equal, series_equal
from solution import ages, average_age, by_name, first_and_last, make_people, row_for, shape_info


def people():
    return pd.DataFrame(
        {
            "name": ["Ada", "Grace", "Linus", "Guido"],
            "age": [36, 45, 28, 50],
            "city": ["London", "New York", "Helsinki", "Amsterdam"],
        }
    )


def test_make_people():
    expected = pd.DataFrame({"name": ["Ada", "Grace", "Linus"], "age": [36, 45, 28], "city": ["London", "New York", "Helsinki"]})
    frame_equal(make_people(), expected)


def test_ages():
    series_equal(ages(people()), pd.Series([36, 45, 28, 50], name="age"))


def test_shape_info():
    equal(shape_info(people()), (4, 3, ["name", "age", "city"]))
    equal(shape_info(people()[["name"]]), (4, 1, ["name"]))


def test_first_and_last():
    df = people()
    result = first_and_last(df)
    frame_equal(result, df.loc[[0, 3]])
    equal(list(result.index), [0, 3], "the original index labels are kept")


def test_first_and_last_of_one_row():
    df = people().head(1)
    equal(list(first_and_last(df)["name"]), ["Ada", "Ada"])


def test_by_name():
    df = people()
    result = by_name(df)
    equal(list(result.index), ["Ada", "Grace", "Linus", "Guido"])
    equal(result.index.name, "name")
    equal(list(result.columns), ["age", "city"])
    equal(list(df.columns), ["name", "age", "city"], "the input frame must not change")


def test_row_for():
    equal(row_for(people(), "Grace"), {"age": 45, "city": "New York"})
    equal(row_for(people(), "Guido"), {"age": 50, "city": "Amsterdam"})


def test_average_age():
    equal(average_age(people()), 39.75)
    equal(average_age(people().head(2)), 40.5)
