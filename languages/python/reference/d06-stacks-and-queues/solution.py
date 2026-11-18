from collections import deque

PAIRS = {")": "(", "]": "[", "}": "{"}


def balanced(text: str) -> bool:
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in PAIRS:
            if not stack or stack.pop() != PAIRS[ch]:
                return False
    return not stack


def eval_rpn(tokens: list[str]) -> int:
    stack: list[int] = []
    for token in tokens:
        if token in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if token == "+":
                stack.append(a + b)
            elif token == "-":
                stack.append(a - b)
            elif token == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))
        else:
            stack.append(int(token))
    return stack.pop()


class RecentLog:
    def __init__(self, maxlen: int):
        self._items: deque = deque(maxlen=maxlen)

    def add(self, item) -> None:
        self._items.append(item)

    def items(self) -> list:
        return list(self._items)


def last_standing(names: list[str], k: int) -> str:
    q = deque(names)
    while len(q) > 1:
        q.rotate(-(k - 1))
        q.popleft()
    return q[0]


def bfs_order(graph: dict[str, list[str]], start: str) -> list[str]:
    order = []
    seen = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        order.append(node)
        for nxt in graph.get(node, []):
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return order


if __name__ == "__main__":
    print(balanced("f(a[1])"), eval_rpn(["2", "3", "+"]))
