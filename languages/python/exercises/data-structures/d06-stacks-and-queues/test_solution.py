from dojo_test import equal, false, true
from solution import RecentLog, balanced, bfs_order, eval_rpn, last_standing


def test_balanced():
    true(balanced("([]{})"))
    true(balanced("f(a[1], {b: 2})"))
    true(balanced(""))


def test_unbalanced():
    false(balanced("(]"))
    false(balanced("(()"))
    false(balanced("())"))
    false(balanced("([)]"))
    false(balanced("}"))


def test_eval_rpn():
    equal(eval_rpn(["2", "3", "+", "4", "*"]), 20)
    equal(eval_rpn(["5", "1", "2", "+", "4", "*", "+", "3", "-"]), 14)
    equal(eval_rpn(["42"]), 42)


def test_eval_rpn_division_truncates_toward_zero():
    equal(eval_rpn(["7", "2", "/"]), 3)
    equal(eval_rpn(["7", "-2", "/"]), -3)
    equal(eval_rpn(["10", "3", "-"]), 7)


def test_recent_log():
    log = RecentLog(3)
    equal(log.items(), [])
    for x in ["a", "b", "c", "d", "e"]:
        log.add(x)
    equal(log.items(), ["c", "d", "e"])


def test_recent_logs_are_separate():
    a = RecentLog(2)
    b = RecentLog(2)
    a.add(1)
    equal(b.items(), [])


def test_last_standing():
    equal(last_standing(["a", "b", "c", "d", "e"], 2), "c")
    equal(last_standing(["a", "b", "c", "d", "e", "f", "g"], 3), "d")
    equal(last_standing(["solo"], 5), "solo")
    equal(last_standing(["a", "b", "c"], 1), "c")


def test_bfs_order():
    graph = {"a": ["b", "c"], "b": ["d"], "c": ["d", "e"], "d": ["a"], "e": []}
    equal(bfs_order(graph, "a"), ["a", "b", "c", "d", "e"])
    equal(bfs_order(graph, "c"), ["c", "d", "e", "a", "b"])
    equal(bfs_order({"x": []}, "x"), ["x"])
