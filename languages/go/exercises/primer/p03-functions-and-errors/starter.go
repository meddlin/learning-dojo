package main

import (
	"errors"
	"fmt"
)

var (
	ErrDivideByZero = errors.New("divide by zero")
	ErrEmpty        = errors.New("no values")
	ErrNotPositive  = errors.New("not positive")
)

// Divide returns a / b, or ErrDivideByZero if b is 0.
func Divide(a, b int) (int, error) {
	return 0, nil // TODO
}

// MinMax returns the smallest and largest of its arguments, or ErrEmpty if none.
func MinMax(xs ...int) (lo, hi int, err error) {
	return 0, 0, nil // TODO
}

// ParsePositive parses a positive integer. If s is not a number, return an error
// wrapping the parse error (with %w) that mentions s. If the number is <= 0,
// return an error wrapping ErrNotPositive that mentions s.
func ParsePositive(s string) (int, error) {
	return 0, nil // TODO
}

// Try runs f and returns an error (instead of crashing) if f panics.
// The error text must contain the panic value. If f does not panic, return nil.
func Try(f func()) (err error) {
	f()
	return nil // TODO: recover from panics
}

// DeferOrder must return exactly ["work", "third", "second", "first"], using defer.
func DeferOrder() (steps []string) {
	return nil // TODO
}

func main() {
	q, err := Divide(7, 0)
	fmt.Println(q, err)
}
