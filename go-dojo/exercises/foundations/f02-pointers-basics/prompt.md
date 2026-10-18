# Pointers and addresses

## Concept

A pointer holds the address of a variable. `&x` takes the address, `*p` follows it, and the type "pointer to int" is `*int`.

```go
x := 10
p := &x        // p is *int, pointing at x
*p = 11        // x is now 11
fmt.Println(*p, x == *p)   // 11 true

var q *int     // the zero value of a pointer is nil
// *q = 1      // panic: invalid memory address or nil pointer dereference
```

What Go changes compared to C:

- **No pointer arithmetic.** You cannot add to a pointer; walk a slice by index.
- **No dangling stack pointers.** Returning `&local` is fine: the compiler moves `local` to the heap when it escapes, and the garbage collector frees it when nothing points at it any more. You never call `free`.
- **A nil dereference panics** (with a clear message) instead of corrupting memory.
- **Pointers into slices are real.** `&s[i]` is the address of that element *inside the slice's array*, so writing through it changes `s`. The loop variable in `for _, v := range s` is a **copy**, so `&v` is not what you want.

Pointers to pointers (`**int`) exist and are used the same way: `*pp` is a `*int`.

Why use pointers at all? To let a function modify its caller's variable, to avoid copying large structs, and to represent "no value" with `nil`. Go passes everything by value, so a function that must change something needs to be given its address.

## Your task

Implement in `solution.go`:

1. `MinMaxInto(values []int, lo, hi *int)`: `values` is not empty. Write the smallest and largest value through the out pointers.
2. `BumpIfPositive(p *int) bool`: if `p` is not nil and `*p > 0`, add one to `*p` and return true; otherwise return false and change nothing.
3. `FindFirst(values []int, target int) *int`: a pointer to the first element equal to `target`, or nil if there is none. The tests write through the returned pointer to check that you returned an address *into the slice*.
4. `NewCounter(start int) *int`: a pointer to a new int holding `start`. Each call returns a different variable.
5. `SwapPointers(a, b **int)`: swap which ints the two pointers point at. The ints themselves must not change.
