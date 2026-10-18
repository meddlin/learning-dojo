# Interfaces and type switches

## Concept

An **interface** is a set of method signatures. A type satisfies an interface **implicitly**, simply by having those methods, with no `implements` declaration. This is Go's main tool for abstraction, and it lets you define an interface in the code that *uses* it, not in the code that provides the type.

```go
type Shape interface {
	Area() float64
}

type Circle struct{ R float64 }
func (c Circle) Area() float64 { return math.Pi * c.R * c.R }

var s Shape = Circle{2}        // fine: Circle has Area
fmt.Println(s.Area())          // dynamic dispatch
```

Habits worth knowing: keep interfaces **small** (one or two methods), accept interfaces and return concrete types, and remember that `error` and `fmt.Stringer` (`String() string`) are just interfaces from the standard library. If a type has a `String()` method, `fmt` uses it when printing.

`any` (an alias for `interface{}`) is the interface with no methods, so every value satisfies it. To get a concrete value back out you use a **type assertion** (`n, ok := v.(int)`) or a **type switch**:

```go
switch x := v.(type) {
case int:
	return x + 1          // x is an int here
case string:
	return len(x)         // x is a string here
case nil:
	return 0
default:
	return -1             // x has v's original type
}
```

**Enumerations** are usually a named integer type plus constants built with `iota`, which counts up from 0 inside a `const ( ... )` block:

```go
type Weekday int

const (
	Sunday Weekday = iota // 0
	Monday                // 1
	Tuesday               // 2
)
```

## Your task

`Shape`, `Circle`, `Square` and `Weekday` (with its constants) are provided. Implement in `solution.go`:

1. The methods `Area() float64` and `Perimeter() float64` for `Circle` (radius `R`) and `Square` (side `Side`), so both satisfy `Shape`.
2. `TotalArea(shapes []Shape) float64`: the sum of the areas.
3. `Describe(v any) string` using a type switch: an `int` gives `"int 5"`, a `string` gives `"string \"hi\""` (quoted with `%q`), a `[]int` gives `"slice of 3 ints"`, `nil` gives `"nil"`, anything else gives `"unknown"`.
4. `(Weekday) String() string`: `"Sunday"`, `"Monday"`, and so on, so that `fmt.Sprint(Tuesday)` prints `Tuesday`. Out-of-range values give `"Weekday(9)"`.
