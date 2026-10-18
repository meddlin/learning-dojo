package main

import (
	"fmt"
	"math"
)

type Shape interface {
	Area() float64
	Perimeter() float64
}

type Circle struct{ R float64 }

type Square struct{ Side float64 }

func (c Circle) Area() float64      { return math.Pi * c.R * c.R }
func (c Circle) Perimeter() float64 { return 2 * math.Pi * c.R }
func (s Square) Area() float64      { return s.Side * s.Side }
func (s Square) Perimeter() float64 { return 4 * s.Side }

func TotalArea(shapes []Shape) float64 {
	total := 0.0
	for _, s := range shapes {
		total += s.Area()
	}
	return total
}

func Describe(v any) string {
	switch x := v.(type) {
	case int:
		return fmt.Sprintf("int %d", x)
	case string:
		return fmt.Sprintf("string %q", x)
	case []int:
		return fmt.Sprintf("slice of %d ints", len(x))
	case nil:
		return "nil"
	default:
		return "unknown"
	}
}

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

var dayNames = [...]string{"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"}

func (d Weekday) String() string {
	if d < 0 || int(d) >= len(dayNames) {
		return fmt.Sprintf("Weekday(%d)", int(d))
	}
	return dayNames[d]
}

func main() {
	shapes := []Shape{Circle{1}, Square{2}}
	fmt.Println(TotalArea(shapes))
	fmt.Println(Tuesday)
}
