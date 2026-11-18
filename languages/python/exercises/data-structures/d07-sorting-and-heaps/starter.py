import bisect
import heapq


def sort_people(people: list[dict]) -> list[dict]:
    raise NotImplementedError


def k_smallest(nums: list[int], k: int) -> list[int]:
    raise NotImplementedError


def merge_sorted(lists: list[list[int]]) -> list[int]:
    raise NotImplementedError


class TaskQueue:
    def __init__(self):
        raise NotImplementedError

    def push(self, priority: int, name: str) -> None:
        raise NotImplementedError

    def pop(self) -> str:
        raise NotImplementedError

    def __len__(self) -> int:
        raise NotImplementedError


def grade_letters(scores: list[float]) -> list[str]:
    raise NotImplementedError


def insert_sorted(items: list, x) -> list:
    raise NotImplementedError


if __name__ == "__main__":
    heap = []
    for n in [5, 1, 4, 2]:
        heapq.heappush(heap, n)
    print(heap[0], heapq.heappop(heap), heap)
