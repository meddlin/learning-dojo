# Structs and value semantics

## Concept

Go structs are **values**. Assigning one, passing one to a function, or storing one in a slice copies all its fields:

```go
type Point struct{ X, Y int }

a := Point{1, 2}
b := a        // independent copy
b.X = 99      // a.X is still 1
a == Point{1, 2}   // true: structs compare field by field when every field is comparable
```

That has some consequences worth learning once:

- **`for _, p := range pts` gives you a copy** of each element. Changing `p` changes nothing in `pts`, and `&p` is the address of that one reused copy. To modify elements use the index (`pts[i].X++`), or take `&pts[i]`.
- **Map elements are not addressable.** `m[k].Field = v` does not compile. Read the struct, modify the copy, store it back (or store pointers in the map).
- **Comparable structs can be map keys**: `map[Point]int` is perfectly good, a neat way to say "grid cell".
- **Embedding** puts one struct inside another without a field name: `type Dog struct { Animal; Breed string }`. The embedded type's fields and methods are *promoted* (`d.Name`, `d.Speak()`). It looks like inheritance but it is composition with shortcuts: a method promoted from `Animal` runs with an `Animal` receiver and knows nothing about `Dog`, so there is **no virtual dispatch**. If `Animal.Introduce` calls `a.Speak()`, it calls `Animal.Speak` even on a dog. Define `Dog.Introduce` yourself to change that, or use an interface when you want polymorphism.

A slice of structs is stored contiguously, so `&pts[i]` points straight into it. A pointer you keep *stays valid* after the slice grows, but then points into the *old* array (the same aliasing story as in the slices exercise).

## Your task

Implement in `solution.go`:

1. `Translate(pts []Point, dx, dy int)`: move every point in the caller's slice, in place.
2. `Contains(r Rect, p Point) bool`: `X` in `[Left, Left+Width)` and `Y` in `[Top, Top+Height)`. The left and top edges are inside, the right and bottom edges are outside (`Y` grows downward, as on a screen).
3. `Biggest(rects []Rect) *Rect`: a pointer to the element of `rects` with the largest area (the first one on ties), or nil if there are none. The tests write through the pointer.
4. `Restock(inv map[string]Item, name string, n int)`: add `n` to the quantity of `name`, creating the item (with that name) if it is not in the inventory yet.
5. `Dog`: `NewDog(name, breed string) Dog`; `Dog.Speak()` returns `"Woof"`; and `Dog.Introduce()` returns `"<Name> says Woof"`. (`Animal` is provided.)
