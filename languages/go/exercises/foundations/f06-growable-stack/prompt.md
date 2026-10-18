# A growable generic stack

## Concept

`append` hides a lot: allocating a bigger array, copying, and keeping the spare capacity. To really understand it, build the same machinery yourself, as a **generic** type.

```go
type Stack[T any] struct {
	data []T // the whole backing buffer: len(data) is the capacity
	size int // how many slots are in use
}

s := NewStack[int]()
s.Push(1)
```

Four ideas meet here:

- **Amortised growth.** When the buffer is full, allocate one twice as big and copy. A push is occasionally expensive (O(n) to copy) but on average O(1), because the copying cost is spread over all the pushes since the last resize. Growing by a constant (+1 or +10) instead would make n pushes cost O(n²).
- **Generic types.** `Stack[T any]` works for any element type; methods declare the same parameter in the receiver: `func (s *Stack[T]) Push(v T)`. To return "nothing" you need the zero value of `T`: `var zero T`.
- **A useful zero value.** Go APIs are nicest when `var s Stack[int]` already works, without a constructor call. If `Push` treats a nil `data` as "capacity 0, grow to 2", it does.
- **Garbage collection.** There is no destructor to write, but the collector can only free what nothing points at. If your stack keeps a popped pointer in a slot above `size`, that object stays alive (a "leak" by retention). Clear a slot when you give it up.

Errors in Go are values: `Pop` on an empty stack returns `ErrEmpty` instead of panicking.

## Your task

`Stack`, `ErrEmpty`, `Len()` and `Cap()` are provided. Implement in `solution.go`:

- `NewStack[T any]() *Stack[T]`: an empty stack whose buffer starts with room for 2 items.
- `(*Stack[T]) Push(v T)`: when the buffer is full, **double** it (allocate a bigger buffer, copy, switch over; use `make` and `copy`, not `append`), then store the value. It must also work on a zero-value `Stack` that never went through `NewStack`.
- `(*Stack[T]) Pop() (T, error)`: remove and return the top element, or the zero value and `ErrEmpty`. Clear the vacated slot.
- `(*Stack[T]) Peek() (T, error)`: the top element without removing it, or the zero value and `ErrEmpty`.

The tests check ordering, growth, the error cases, that you grow geometrically (doubling) rather than one slot at a time, and that popped slots are cleared.
