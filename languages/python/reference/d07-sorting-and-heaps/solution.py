import bisect
import heapq


def sort_people(people: list[dict]) -> list[dict]:
    return sorted(people, key=lambda p: (p["age"], p["name"]))


def k_smallest(nums: list[int], k: int) -> list[int]:
    return heapq.nsmallest(k, nums)


def merge_sorted(lists: list[list[int]]) -> list[int]:
    return list(heapq.merge(*lists))


class TaskQueue:
    def __init__(self):
        self._heap: list[tuple[int, int, str]] = []
        self._count = 0

    def push(self, priority: int, name: str) -> None:
        heapq.heappush(self._heap, (priority, self._count, name))
        self._count += 1

    def pop(self) -> str:
        return heapq.heappop(self._heap)[2]

    def __len__(self) -> int:
        return len(self._heap)


def grade_letters(scores: list[float]) -> list[str]:
    breakpoints = [60, 70, 80, 90]
    letters = "FDCBA"
    return [letters[bisect.bisect_right(breakpoints, s)] for s in scores]


def insert_sorted(items: list, x) -> list:
    out = list(items)
    bisect.insort(out, x)
    return out


if __name__ == "__main__":
    q = TaskQueue()
    q.push(2, "write")
    q.push(1, "plan")
    print(q.pop(), len(q))
