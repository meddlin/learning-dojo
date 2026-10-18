# Structs, methods and pointers

## Concept

A **struct** groups named fields. A **method** is a function with a receiver, written before the name:

```go
type Rect struct {
	W, H float64
}

func (r Rect) Area() float64 { return r.W * r.H }       // value receiver: works on a copy

func (r *Rect) Grow(d float64) { r.W += d; r.H += d }   // pointer receiver: can change the original

r := Rect{W: 3, H: 4}        // composite literal; Rect{3, 4} also works
r.Grow(1)                    // Go writes (&r).Grow(1) for you
fmt.Println(r.Area())        // 20
```

**Pointers.** `&x` is the address of `x`, `*p` is the value `p` points to, and `*T` is the type "pointer to T". There is no pointer arithmetic. A pointer you have not set is `nil`, and dereferencing it panics.

```go
n := 5
p := &n
*p = 6          // n is now 6
q := new(int)   // pointer to a fresh zero int
```

**Everything is passed by value.** Pass a struct to a function and it gets a copy; pass a pointer and it gets a copy of the *pointer*, which still points at your struct. That is why a method that must modify its receiver uses a pointer receiver. Rule of thumb: if any method of a type needs a pointer receiver, give them all pointer receivers.

**Structs are comparable** with `==` when all their fields are, and an unset struct is the zero value of each field: `var r Rect` is `Rect{0, 0}`, ready to use. Good Go types make their zero value useful.

## Your task

`Rect`, `Account` and `ErrInsufficient` are provided. Implement in `solution.go`:

1. `(Rect) Area() float64` and `(Rect) Perimeter() float64`.
2. `(*Rect) Scale(factor float64)`: multiply width and height **in place**.
3. `(Rect) Scaled(factor float64) Rect`: return a scaled copy, leaving the original unchanged.
4. `Swap(a, b *int)`: exchange the two integers the pointers point at.
5. `(*Account) Deposit(n int)`, `(*Account) Withdraw(n int) error` (returns `ErrInsufficient` and changes nothing if the balance is too low) and `(*Account) Balance() int`.
