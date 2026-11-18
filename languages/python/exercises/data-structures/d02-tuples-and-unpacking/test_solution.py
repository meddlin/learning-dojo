from dojo_test import equal, raises, true
from solution import Point, head_tail, min_max, parse_point, rank, swap_pairs, transpose


def test_min_max():
    equal(min_max([3, 1, 4, 1, 5]), (1, 5))
    equal(min_max([7]), (7, 7))


def test_min_max_of_nothing_raises():
    raises(ValueError, min_max, [])


def test_head_tail():
    equal(head_tail([1, 2, 3]), (1, [2, 3]))
    equal(head_tail(["only"]), ("only", []))


def test_parse_point():
    p = parse_point("3,4")
    true(isinstance(p, Point))
    equal(p, Point(3, 4))
    equal((p.x, p.y), (3, 4))
    equal(parse_point(" -1 , 10 "), Point(-1, 10))


def test_transpose():
    equal(transpose([(1, "a"), (2, "b"), (3, "c")]), ((1, 2, 3), ("a", "b", "c")))
    equal(transpose([]), ())


def test_swap_pairs():
    equal(swap_pairs([(1, "a"), (2, "b")]), [("a", 1), ("b", 2)])


def test_rank():
    records = [("cy", 70), ("ann", 90), ("bo", 70), ("dee", 95)]
    equal(rank(records), [("dee", 95), ("ann", 90), ("bo", 70), ("cy", 70)])
    equal(records[0], ("cy", 70), "the input must not be reordered")
