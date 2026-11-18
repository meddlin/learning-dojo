from dojo_test import equal, false, true
from solution import initials, is_palindrome, mask_email, reverse_words, slug


def test_reverse_words():
    equal(reverse_words("hello big world"), "world big hello")
    equal(reverse_words("one"), "one")


def test_reverse_words_collapses_whitespace():
    equal(reverse_words("  hello   big\tworld "), "world big hello")
    equal(reverse_words("   "), "")


def test_is_palindrome_simple():
    true(is_palindrome("racecar"))
    true(is_palindrome(""))
    false(is_palindrome("python"))


def test_is_palindrome_ignores_case_and_punctuation():
    true(is_palindrome("A man, a plan, a canal: Panama"))
    true(is_palindrome("No 'x' in Nixon"))
    false(is_palindrome("ab, ba!c"))


def test_initials():
    equal(initials("ada lovelace"), "A.L.")
    equal(initials("Grace Brewster Hopper"), "G.B.H.")
    equal(initials("  guido   van rossum "), "G.V.R.")
    equal(initials(""), "")


def test_mask_email():
    equal(mask_email("grace@navy.mil"), "g***@navy.mil")
    equal(mask_email("a@b.co"), "a***@b.co")


def test_slug():
    equal(slug("Hello, World! 2024"), "hello-world-2024")
    equal(slug("  Python -- is   FUN  "), "python-is-fun")
    equal(slug("already-a-slug"), "already-a-slug")
    equal(slug("!!!"), "")
