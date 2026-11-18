from dojo_test import equal
from solution import TaskQueue, grade_letters, insert_sorted, k_smallest, merge_sorted, sort_people


def test_sort_people():
    people = [{"name": "cy", "age": 30}, {"name": "ann", "age": 25}, {"name": "bo", "age": 30}]
    equal([p["name"] for p in sort_people(people)], ["ann", "bo", "cy"])
    equal(people[0]["name"], "cy", "the input must not be reordered")


def test_k_smallest():
    equal(k_smallest([5, 1, 9, 3, 7, 1], 3), [1, 1, 3])
    equal(k_smallest([4, 2], 5), [2, 4])
    equal(k_smallest([4, 2], 0), [])


def test_merge_sorted():
    equal(merge_sorted([[1, 4, 9], [2, 3], [], [5, 10]]), [1, 2, 3, 4, 5, 9, 10])
    equal(merge_sorted([]), [])


def test_task_queue_lowest_priority_first():
    q = TaskQueue()
    q.push(3, "deploy")
    q.push(1, "test")
    q.push(2, "review")
    equal(len(q), 3)
    equal([q.pop(), q.pop(), q.pop()], ["test", "review", "deploy"])
    equal(len(q), 0)


def test_task_queue_ties_are_first_in_first_out():
    q = TaskQueue()
    for name in ["zeta", "alpha", "mid"]:
        q.push(1, name)
    q.push(0, "urgent")
    equal([q.pop() for _ in range(4)], ["urgent", "zeta", "alpha", "mid"])


def test_grade_letters():
    equal(grade_letters([33, 59.9, 60, 77, 70, 89, 90, 100]), ["F", "F", "D", "C", "C", "B", "A", "A"])
    equal(grade_letters([]), [])


def test_insert_sorted():
    items = [1, 3, 5]
    equal(insert_sorted(items, 4), [1, 3, 4, 5])
    equal(insert_sorted(items, 0), [0, 1, 3, 5])
    equal(insert_sorted([], "a"), ["a"])
    equal(items, [1, 3, 5], "the input must not change")
