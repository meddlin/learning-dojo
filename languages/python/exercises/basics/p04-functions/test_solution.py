from dojo_test import equal, raises, true
from solution import add_item, apply_n, describe, greet, make_counter, total


def test_greet_defaults():
    equal(greet("Ada"), "Hello, Ada!")
    equal(greet("Ada", "Hi"), "Hi, Ada!")


def test_greet_keyword_only_punctuation():
    equal(greet("Ada", punctuation="?"), "Hello, Ada?")
    equal(greet("Ada", "Hi", punctuation="?"), "Hi, Ada?")
    raises(TypeError, greet, "Ada", "Hi", "?")


def test_total():
    equal(total(), 0)
    equal(total(1, 2, 3), 6)
    equal(total(1, 2, start=10), 13)
    equal(total(*range(101)), 5050)


def test_add_item_with_a_list():
    mine = ["a"]
    result = add_item("b", mine)
    equal(result, ["a", "b"])
    true(result is mine, "it should append to the list it was given")


def test_add_item_without_a_list_starts_fresh_each_time():
    equal(add_item(1), [1])
    equal(add_item(2), [2])


def test_describe():
    equal(describe(b=2, a=1), "a=1, b=2")
    equal(describe(name="ada", year=1843), "name=ada, year=1843")
    equal(describe(), "")


def test_make_counter_counts():
    counter = make_counter()
    equal([counter(), counter(), counter()], [1, 2, 3])


def test_counters_are_independent():
    a = make_counter()
    b = make_counter()
    a()
    a()
    equal(b(), 1)
    equal(a(), 3)


def test_apply_n():
    equal(apply_n(lambda x: x * 2, 3, 1), 8)
    equal(apply_n(str.upper, 1, "hi"), "HI")
    equal(apply_n(lambda x: x + 1, 0, 5), 5)
