from dojo_test import equal, false, true
from solution import common, has_duplicates, in_exactly_one, is_subset, missing_numbers, only_in_first, shared_by_all, unique_letters


def test_has_duplicates():
    true(has_duplicates([1, 2, 3, 2]))
    false(has_duplicates([1, 2, 3]))
    false(has_duplicates([]))
    true(has_duplicates("hello"))


def test_common_and_differences():
    a = ["ann", "bob", "cy"]
    b = ("bob", "cy", "dee")
    equal(common(a, b), {"bob", "cy"})
    equal(only_in_first(a, b), {"ann"})
    equal(in_exactly_one(a, b), {"ann", "dee"})
    equal(common([], b), set())


def test_missing_numbers():
    equal(missing_numbers([3, 1, 5], 6), [2, 4, 6])
    equal(missing_numbers(range(1, 4), 3), [])
    equal(missing_numbers([], 3), [1, 2, 3])


def test_unique_letters():
    true(unique_letters("python"))
    false(unique_letters("Alpha"))
    true(unique_letters(""))


def test_shared_by_all():
    groups = [{"a", "b", "c"}, {"b", "c", "d"}, {"c", "b", "z"}]
    equal(shared_by_all(groups), {"b", "c"})
    equal(shared_by_all([{"x"}]), {"x"})
    equal(shared_by_all([]), set())


def test_shared_by_all_does_not_change_the_input():
    groups = [{"a", "b"}, {"b"}]
    shared_by_all(groups)
    equal(groups, [{"a", "b"}, {"b"}])


def test_is_subset():
    true(is_subset([1, 2], [3, 2, 1]))
    true(is_subset([], [1]))
    false(is_subset([1, 4], [1, 2, 3]))
