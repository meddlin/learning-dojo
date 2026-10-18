package main

import (
	"errors"
	"fmt"
)

// Rect is a rectangle.
type Rect struct {
	W, H float64
}

// Area returns W * H.
func (r Rect) Area() float64 {
	return 0 // TODO
}

// Perimeter returns the length around the rectangle.
func (r Rect) Perimeter() float64 {
	return 0 // TODO
}

// Scale multiplies the width and height IN PLACE (the receiver must be a pointer).
func (r Rect) Scale(factor float64) {
	// TODO: change the receiver type so the caller's Rect really changes
}

// Scaled returns a scaled copy and leaves r unchanged.
func (r Rect) Scaled(factor float64) Rect {
	return Rect{} // TODO
}

// Swap exchanges the integers a and b point at.
func Swap(a, b *int) {
	// TODO
}

// ErrInsufficient is returned when a withdrawal exceeds the balance.
var ErrInsufficient = errors.New("insufficient funds")

// Account holds a balance.
type Account struct {
	balance int
}

// Deposit adds n to the balance.
func (a *Account) Deposit(n int) {
	// TODO
}

// Withdraw removes n from the balance, or returns ErrInsufficient (changing
// nothing) if n is more than the balance.
func (a *Account) Withdraw(n int) error {
	return nil // TODO
}

// Balance returns the current balance.
func (a *Account) Balance() int {
	return -1 // TODO
}

func main() {
	r := Rect{3, 4}
	r.Scale(2)
	fmt.Println(r, r.Area())
}
