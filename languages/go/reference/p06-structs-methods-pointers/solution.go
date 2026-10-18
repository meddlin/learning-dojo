package main

import (
	"errors"
	"fmt"
)

type Rect struct {
	W, H float64
}

func (r Rect) Area() float64 { return r.W * r.H }

func (r Rect) Perimeter() float64 { return 2 * (r.W + r.H) }

func (r *Rect) Scale(factor float64) {
	r.W *= factor
	r.H *= factor
}

func (r Rect) Scaled(factor float64) Rect {
	return Rect{r.W * factor, r.H * factor}
}

func Swap(a, b *int) {
	*a, *b = *b, *a
}

var ErrInsufficient = errors.New("insufficient funds")

type Account struct {
	balance int
}

func (a *Account) Deposit(n int) { a.balance += n }

func (a *Account) Withdraw(n int) error {
	if n > a.balance {
		return ErrInsufficient
	}
	a.balance -= n
	return nil
}

func (a *Account) Balance() int { return a.balance }

func main() {
	r := Rect{3, 4}
	r.Scale(2)
	fmt.Println(r, r.Area())
}
