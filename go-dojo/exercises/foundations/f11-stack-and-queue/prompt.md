# Stacks and queues

## Concept

A **stack** is last-in, first-out (LIFO): think of a pile of plates. A **queue** is first-in, first-out (FIFO): a line at a counter. These two shapes sit inside DFS (stack) and BFS (queue), in undo histories, expression parsers, schedulers and message pipelines.

In Go you build both from a slice; no special type is needed:

```go
// stack
stack = append(stack, x)                 // push
top := stack[len(stack)-1]               // peek
stack = stack[:len(stack)-1]             // pop

// queue
queue = append(queue, x)                 // enqueue
front := queue[0]                        // peek
queue = queue[1:]                        // dequeue
```

A note on that queue: `queue = queue[1:]` is O(1) but never gives the front space back, and the slice keeps the whole old array alive until it reallocates. For a short-lived queue (BFS, this exercise) that is fine; for a long-running one, use a ring buffer or `container/list`.

Patterns worth knowing:

- **Matching and nesting** (brackets, HTML tags, function calls) is a stack problem: the most recently opened thing must be the next one closed.
- **Reverse Polish Notation** (RPN, postfix: `2 1 + 3 *`) evaluates with a stack and needs no parentheses: numbers are pushed, an operator pops its two operands and pushes the result.
- **Simulations with rotation** (people in a circle, round-robin scheduling) are queue problems: take from the front, put back at the end.
- **A stack that remembers more**: keep a second stack alongside it holding "the answer so far", for example the running minimum, to get O(1) `Min`.

Real code that can fail should return an `error` instead of crashing: here malformed RPN input gives `ErrMalformed`, not a panic from popping an empty stack.

## Your task

`ErrMalformed` and `ErrDivByZero` are provided. Implement in `solution.go`:

1. `BalancedBrackets(s string) bool`: true if every `(`, `[` and `{` is closed by the matching bracket in the correct order. Other characters are ignored; the empty string is balanced.
2. `EvalRPN(tokens []string) (int, error)`: evaluate a postfix expression. Tokens are integers (possibly negative, like `"-11"`) or `+ - * /`; division truncates toward zero. `{"2","1","+","3","*"}` is `(2 + 1) * 3 = 9`. Return `ErrMalformed` for an unknown token, too few operands, or leftover operands (including no tokens at all), and `ErrDivByZero` when dividing by zero.
3. `LastSurvivor(n, k int) int`: `n` people stand in a circle, numbered `1..n`. Starting from person 1, count `k` people and remove the k-th, continue counting from the next person, and repeat until one is left. Return that person's number. (`n >= 1`, `k >= 1`.) Use a queue.
4. `MinStack`: a stack of ints with `Push(v int)`, `Pop() (int, bool)`, `Min() (int, bool)` and `Len() int`, where `Min` is O(1). `Pop` and `Min` return `false` on an empty stack. The zero value must be ready to use.
