package main

import "fmt"

// Point is a position on a grid.
type Point struct{ X, Y int }

// Rect is a rectangle. Y grows downward.
type Rect struct{ Left, Top, Width, Height int }

// Item is a stock entry.
type Item struct {
	Name string
	Qty  int
}

// Translate moves every point of pts by (dx, dy), in the caller's slice.
func Translate(pts []Point, dx, dy int) {
	// TODO
}

// Contains reports whether p is inside r. The left and top edges count as inside,
// the right and bottom edges do not.
func Contains(r Rect, p Point) bool {
	return false // TODO
}

// Biggest returns a pointer to the element of rects with the largest area (the
// first one on ties), or nil if rects is empty.
func Biggest(rects []Rect) *Rect {
	return nil // TODO
}

// Restock adds n to the quantity of name, creating the item if it is missing.
func Restock(inv map[string]Item, name string, n int) {
	// TODO
}

// Animal makes a noise. Embedded in Dog below.
type Animal struct{ Name string }

func (a Animal) Speak() string { return "..." }

// Introduce says who is speaking and what they say.
func (a Animal) Introduce() string { return a.Name + " says " + a.Speak() }

// Dog is an Animal with a breed.
type Dog struct {
	Animal
	Breed string
}

// NewDog returns a Dog with the given name and breed.
func NewDog(name, breed string) Dog {
	return Dog{} // TODO
}

// Speak should return "Woof". (Also add Dog.Introduce so a dog introduces itself
// as "<Name> says Woof".)
func (d Dog) Speak() string {
	return "" // TODO
}

func main() {
	d := NewDog("Rex", "labrador")
	fmt.Println(d.Name, d.Speak(), d.Introduce())
}
