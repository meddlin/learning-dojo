from dojo_test import equal
from solution import collatz_steps, first_index_over, fizzbuzz, grade, respond


def test_fizzbuzz():
    equal(fizzbuzz(15), ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"])
    equal(fizzbuzz(0), [])


def test_collatz_steps():
    equal(collatz_steps(1), 0)
    equal(collatz_steps(2), 1)
    equal(collatz_steps(6), 8)
    equal(collatz_steps(27), 111)


def test_first_index_over():
    equal(first_index_over([1, 5, 10, 20], 7), 2)
    equal(first_index_over([8, 9], 7), 0)


def test_first_index_over_when_nothing_is_over():
    equal(first_index_over([1, 2, 3], 3), -1)
    equal(first_index_over([], 0), -1)


def test_grade_bands():
    equal([grade(s) for s in [100, 90, 89.5, 80, 75, 60, 59, 0]], ["A", "A", "B", "B", "C", "D", "F", "F"])


def test_grade_invalid():
    equal(grade(-1), "invalid")
    equal(grade(100.5), "invalid")


def test_respond_movement_and_looking():
    equal(respond("go north"), "You go north.")
    equal(respond("go west"), "You go west.")
    equal(respond("look"), "You look around.")


def test_respond_take_one_or_more_words():
    equal(respond("take lamp"), "You take the lamp.")
    equal(respond("take rusty old key"), "You take the rusty old key.")


def test_respond_quit():
    equal(respond("quit"), "Goodbye.")
    equal(respond("exit"), "Goodbye.")


def test_respond_unknown():
    equal(respond("dance wildly"), "I don't understand: dance wildly")
    equal(respond("take"), "I don't understand: take")
    equal(respond("go"), "I don't understand: go")
    equal(respond("  "), "I don't understand: ")
