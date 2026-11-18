# Stacks and queues

## Concept

A **stack** is last-in, first-out. A Python `list` is a good stack, because adding and removing at the **end** is O(1):

```python
stack = []
stack.append("a")      # push
stack.append("b")
top = stack[-1]        # peek: 'b'
stack.pop()            # 'b'
if not stack: ...      # empty?
```

A **queue** is first-in, first-out. A list is a *bad* queue: `list.pop(0)` shifts every remaining item, so it is O(n). Use `collections.deque`, a double-ended queue with O(1) operations at both ends:

```python
from collections import deque

q = deque(["a", "b"])
q.append("c")          # enqueue at the right
q.popleft()            # 'a': dequeue from the left
q.appendleft("z")
q.rotate(1)            # move the last item to the front (negative: the other way)

recent = deque(maxlen=3)   # bounded: appending a 4th item drops the oldest
```

Queues drive **breadth-first search**: visit the start, then everything one step away, then two steps, and so on.

```python
queue = deque([start]); seen = {start}
while queue:
    node = queue.popleft()
    for nxt in graph[node]:
        if nxt not in seen:
            seen.add(nxt); queue.append(nxt)
```

## Your task

Implement in `solution.py`:

1. `balanced(text)`: `True` if every `(`, `[` and `{` is closed by the matching bracket in the right order. Other characters are ignored.
2. `eval_rpn(tokens)`: evaluate an expression in Reverse Polish Notation, e.g. `["2", "3", "+", "4", "*"]` is `20`. Operators are `+ - * /`; division truncates toward zero (`7 / -2` gives `-3`).
3. `RecentLog(maxlen)`: `add(item)` records an item; `items()` returns the newest `maxlen` items as a list, oldest first. Use a bounded `deque`.
4. `last_standing(names, k)`: people stand in a circle; counting from the first, every `k`-th person leaves, and the count restarts after them. Return the last name left.
5. `bfs_order(graph, start)`: the order breadth-first search visits nodes, where `graph` maps each node to a list of neighbours (visit neighbours in list order).
