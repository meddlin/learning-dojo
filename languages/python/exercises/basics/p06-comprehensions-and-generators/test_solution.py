import itertools
import types

from dojo_test import equal, raises, true
from solution import chunked, count_long, fibonacci, invert, lengths_used, pairs, squares_of_evens, word_lengths


def test_squares_of_evens():
    equal(squares_of_evens([1, 2, 3, 4, 5, 6]), [4, 16, 36])
    equal(squares_of_evens([1, 3]), [])


def test_word_lengths():
    equal(word_lengths(["a", "bb", "ccc"]), {"a": 1, "bb": 2, "ccc": 3})
    equal(word_lengths([]), {})


def test_invert():
    original = {"a": 1, "b": 2}
    equal(invert(original), {1: "a", 2: "b"})
    equal(original, {"a": 1, "b": 2}, "the input must not change")


def test_lengths_used():
    equal(lengths_used(["hi", "yo", "hey", "hello"]), {2, 3, 5})
    equal(lengths_used([]), set())


def test_count_long():
    equal(count_long(["a", "abcd", "abcde", "abc"], 3), 2)
    equal(count_long([], 0), 0)


def test_pairs():
    equal(pairs([1, 2], [2, 3]), [(1, 2), (1, 3), (2, 3)])
    equal(pairs([], [1]), [])


def test_chunked_is_a_generator():
    true(isinstance(chunked([1, 2, 3], 2), types.GeneratorType), "use yield")


def test_chunked():
    equal(list(chunked([1, 2, 3, 4, 5], 2)), [[1, 2], [3, 4], [5]])
    equal(list(chunked(range(6), 3)), [[0, 1, 2], [3, 4, 5]])
    equal(list(chunked([], 3)), [])


def test_chunked_works_lazily_on_infinite_input():
    first = next(chunked(itertools.count(), 4))
    equal(first, [0, 1, 2, 3])


def test_chunked_rejects_bad_sizes():
    raises(ValueError, lambda: list(chunked([1], 0)))


def test_fibonacci():
    equal(list(itertools.islice(fibonacci(), 10)), [0, 1, 1, 2, 3, 5, 8, 13, 21, 34])


def test_fibonacci_goes_on_forever():
    equal(next(itertools.islice(fibonacci(), 90, None)), 2880067194370816120)
