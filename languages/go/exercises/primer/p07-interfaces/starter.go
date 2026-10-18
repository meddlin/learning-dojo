package main

import "fmt"

// Shape is anything with an area and a perimeter.
type Shape interface {
	Area() float64
	Perimeter() float64
}

// Circle has radius R.
type Circle struct{ R float64 }

// Square has side length Side.
type Square struct{ Side float64 }

func (c Circle) Area() float64      { return 0 } // TODO
func (c Circle) Perimeter() float64 { return 0 } // TODO
func (s Square) Area() float64      { return 0 } // TODO
func (s Square) Perimeter() float64 { return 0 } // TODO

// TotalArea returns the sum of the areas of all shapes.
func TotalArea(shapes []Shape) float64 {
	return 0 // TODO
}

// Describe uses a type switch: int -> "int 5", string -> `string "hi"`,
// []int -> "slice of 3 ints", nil -> "nil", anything else -> "unknown".
func Describe(v any) string {
	return "" // TODO
}

// Weekday is a day of the week, counted from Sunday = 0.
type Weekday int

const (
	Sunday Weekday = iota
	Monday
	Tuesday
	Wednesday
	Thursday
	Friday
	Saturday
)

// String returns the day's name, or "Weekday(n)" for values out of range.
func (d Weekday) String() string {
	return "" // TODO
}

func main() {
	shapes := []Shape{Circle{1}, Square{2}}
	fmt.Println(TotalArea(shapes))
	fmt.Println(Tuesday)
}
