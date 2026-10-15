# std::stack and std::queue

## Concept

Two simple access patterns show up everywhere in algorithms:

- A **stack** is last-in, first-out (LIFO): `push` adds on top, `pop` removes from the top.
- A **queue** is first-in, first-out (FIFO): `push` adds at the back, `pop` removes from the front.

The standard library provides both as *adapters* (thin wrappers around `std::deque` by default):

```cpp
std::stack<int> s;     s.push(1); s.push(2);   // top is 2
s.top();               // 2: look at the top
s.pop();               // removes it, but RETURNS NOTHING (void)

std::queue<int> q;     q.push(1); q.push(2);   // front is 1, back is 2
q.front();  q.back();  q.pop();                // pop removes the front, returns void
```

Two C++ quirks:

- `pop()` returns `void`. To use the value, read it with `top()` or `front()` first, then pop.
- Calling `top()`, `front()` or `pop()` on an empty container is undefined behaviour, so check `empty()` first.

Keep these two in mind. When you reach graph traversal, **depth-first search is "use a stack"** and **breadth-first search is "use a queue"**. Same loop, different container, completely different order of visiting.

## Your task

Implement in `solution.cpp`:

1. `bool balanced_brackets(const std::string& s)`: true if every `(`, `[` and `{` is closed by the matching bracket in the correct order. Other characters are ignored; the empty string is balanced.
2. `int evaluate_rpn(const std::vector<std::string>& tokens)`: evaluate a Reverse Polish Notation expression. Tokens are integers (possibly negative, like `"-11"`) or `+ - * /`. Division truncates toward zero, which is what C++ integer division does. `{"2","1","+","3","*"}` is `(2 + 1) * 3 = 9`. All inputs are valid.
3. `int last_survivor(int n, int k)`: `n` people stand in a circle, numbered `1..n`. Starting from person 1, count `k` people and remove the k-th, continue counting from the next person, and repeat until one is left. Return that person's number. Use a `std::queue`.
