package main

import (
	"errors"
	"fmt"
	"strconv"
)

var (
	ErrDivideByZero = errors.New("divide by zero")
	ErrEmpty        = errors.New("no values")
	ErrNotPositive  = errors.New("not positive")
)

func Divide(a, b int) (int, error) {
	if b == 0 {
		return 0, ErrDivideByZero
	}
	return a / b, nil
}

func MinMax(xs ...int) (lo, hi int, err error) {
	if len(xs) == 0 {
		return 0, 0, ErrEmpty
	}
	lo, hi = xs[0], xs[0]
	for _, x := range xs[1:] {
		lo = min(lo, x)
		hi = max(hi, x)
	}
	return lo, hi, nil
}

func ParsePositive(s string) (int, error) {
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0, fmt.Errorf("parse %q: %w", s, err)
	}
	if n <= 0 {
		return 0, fmt.Errorf("parse %q: %w", s, ErrNotPositive)
	}
	return n, nil
}

func Try(f func()) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("recovered: %v", r)
		}
	}()
	f()
	return nil
}

func DeferOrder() (steps []string) {
	defer func() { steps = append(steps, "first") }()
	defer func() { steps = append(steps, "second") }()
	defer func() { steps = append(steps, "third") }()
	steps = append(steps, "work")
	return steps
}

func main() {
	q, err := Divide(7, 0)
	fmt.Println(q, err)
}
