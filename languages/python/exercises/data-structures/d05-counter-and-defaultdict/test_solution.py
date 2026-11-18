from dojo_test import equal, false, true
from solution import combine, index_words, is_anagram, letter_counts, most_common_word


def test_letter_counts():
    equal(dict(letter_counts("Hello, World!")), {"h": 1, "e": 1, "l": 3, "o": 2, "w": 1, "r": 1, "d": 1})
    equal(dict(letter_counts("123 !?")), {})


def test_most_common_word():
    equal(most_common_word("the cat saw the other cat and the dog"), "the")
    equal(most_common_word("b a a b"), "b", "on a tie, the first one seen wins")
    equal(most_common_word("Go go GO stop"), "go")


def test_is_anagram():
    true(is_anagram("listen", "silent"))
    true(is_anagram("Dormitory", "dirty room"))
    false(is_anagram("aab", "abb"))
    false(is_anagram("abc", "abcd"))


def test_combine():
    equal(combine({"a": 1, "b": 2}, {"b": 3, "c": 4}, {"a": 10}), {"a": 11, "b": 5, "c": 4})
    equal(combine(), {})


def test_combine_returns_a_plain_dict():
    equal(type(combine({"a": 1})), dict)


def test_index_words():
    lines = ["the quick fox", "The lazy dog", "quick quick dog"]
    equal(index_words(lines), {"the": [1, 2], "quick": [1, 3], "fox": [1], "lazy": [2], "dog": [2, 3]})


def test_index_words_returns_a_plain_dict():
    index = index_words(["a"])
    equal(type(index), dict, "convert the defaultdict with dict(...)")
    equal(index_words([]), {})
