from dojo_test import equal
from solution import get_path, group_by_first_letter, merge_inventory, top_n, word_count


def test_word_count():
    equal(word_count("the cat and the hat"), {"the": 2, "cat": 1, "and": 1, "hat": 1})


def test_word_count_ignores_case_and_punctuation():
    equal(word_count("Hello, hello! HELLO? -- world."), {"hello": 3, "--": 1, "world": 1})
    equal(word_count("... !!"), {})


def test_word_count_keeps_first_seen_order():
    equal(list(word_count("b a b c a")), ["b", "a", "c"])


def test_group_by_first_letter():
    words = ["apple", "Banana", "avocado", "blueberry", "cherry"]
    equal(group_by_first_letter(words), {"a": ["apple", "avocado"], "b": ["Banana", "blueberry"], "c": ["cherry"]})
    equal(group_by_first_letter([]), {})


def test_merge_inventory():
    a = {"apples": 3, "pears": 1}
    b = {"pears": 4, "plums": 2}
    equal(merge_inventory(a, b), {"apples": 3, "pears": 5, "plums": 2})
    equal(a, {"apples": 3, "pears": 1}, "a must not change")
    equal(b, {"pears": 4, "plums": 2}, "b must not change")


def test_top_n():
    counts = {"c": 2, "a": 5, "b": 2, "d": 1}
    equal(top_n(counts, 3), [("a", 5), ("b", 2), ("c", 2)])
    equal(top_n(counts, 10), [("a", 5), ("b", 2), ("c", 2), ("d", 1)])
    equal(top_n({}, 2), [])


def test_get_path():
    data = {"user": {"name": "ada", "address": {"city": "London"}}, "id": 7}
    equal(get_path(data, "user.address.city"), "London")
    equal(get_path(data, "id"), 7)
    equal(get_path(data, "user.name"), "ada")


def test_get_path_missing():
    data = {"user": {"name": "ada"}, "zero": 0}
    equal(get_path(data, "user.age"), None)
    equal(get_path(data, "user.name.first", "?"), "?")
    equal(get_path(data, "nope.nope", 42), 42)
    equal(get_path(data, "zero", 1), 0, "a stored 0 is not missing")
