from dojo_test import equal, true
from solution import dedupe, flatten, make_grid, moving_average, remove_all, rotate


def test_rotate_right():
    equal(rotate([1, 2, 3, 4], 1), [4, 1, 2, 3])
    equal(rotate([1, 2, 3, 4], 2), [3, 4, 1, 2])
    equal(rotate([1, 2, 3, 4], 0), [1, 2, 3, 4])


def test_rotate_wraps_and_goes_left():
    equal(rotate([1, 2, 3, 4], 6), [3, 4, 1, 2])
    equal(rotate([1, 2, 3, 4], -1), [2, 3, 4, 1])
    equal(rotate([], 3), [])


def test_rotate_returns_a_new_list():
    original = [1, 2, 3]
    rotated = rotate(original, 3)
    equal(original, [1, 2, 3])
    true(rotated is not original, "return a new list, not the input")


def test_dedupe():
    equal(dedupe([3, 1, 3, 2, 1]), [3, 1, 2])
    equal(dedupe(["b", "a", "b"]), ["b", "a"])
    equal(dedupe([]), [])


def test_flatten():
    equal(flatten([[1, 2], [], [3], [4, 5]]), [1, 2, 3, 4, 5])
    equal(flatten([[[1]], [2]]), [[1], 2])
    equal(flatten([]), [])


def test_moving_average():
    equal(moving_average([1, 2, 3, 4, 5], 2), [1.5, 2.5, 3.5, 4.5])
    equal(moving_average([2, 4, 6], 3), [4.0])
    equal(moving_average([1, 2], 3), [])


def test_make_grid():
    equal(make_grid(2, 3), [[0, 0, 0], [0, 0, 0]])
    equal(make_grid(1, 2, "."), [[".", "."]])
    equal(make_grid(0, 5), [])


def test_make_grid_rows_are_independent():
    grid = make_grid(3, 2)
    grid[0][0] = 9
    equal(grid, [[9, 0], [0, 0], [0, 0]])


def test_remove_all_in_place():
    items = [1, 2, 1, 3, 1]
    same = items
    result = remove_all(items, 1)
    equal(result, None, "in-place functions return None")
    equal(items, [2, 3])
    true(same is items)
    equal(same, [2, 3], "the caller's list itself must change")
