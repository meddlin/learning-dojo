package main

import (
	"errors"
	"testing"
)

func TestAreaAndPerimeter(t *testing.T) {
	r := Rect{3, 4}
	Equal(t, r.Area(), 12.0)
	Equal(t, r.Perimeter(), 14.0)
	Equal(t, Rect{}.Area(), 0.0)
}

func TestScaleChangesTheRectInPlace(t *testing.T) {
	r := Rect{3, 4}
	r.Scale(2)
	Equal(t, r, Rect{6, 8})
	r.Scale(0.5)
	Equal(t, r, Rect{3, 4})
}

func TestScaleThroughAPointer(t *testing.T) {
	r := &Rect{1, 2}
	r.Scale(10)
	Equal(t, r.W, 10.0)
	Equal(t, r.H, 20.0)
}

func TestScaledReturnsACopy(t *testing.T) {
	r := Rect{3, 4}
	s := r.Scaled(2)
	Equal(t, s, Rect{6, 8})
	Equal(t, r, Rect{3, 4})
}

func TestSwap(t *testing.T) {
	a, b := 1, 2
	Swap(&a, &b)
	Equal(t, a, 2)
	Equal(t, b, 1)
}

func TestSwapSameVariableTwiceIsHarmless(t *testing.T) {
	a := 7
	Swap(&a, &a)
	Equal(t, a, 7)
}

func TestAccountStartsEmpty(t *testing.T) {
	var acct Account
	Equal(t, acct.Balance(), 0)
}

func TestDepositAndWithdraw(t *testing.T) {
	var acct Account
	acct.Deposit(100)
	acct.Deposit(50)
	Equal(t, acct.Balance(), 150)
	Equal(t, acct.Withdraw(30), nil)
	Equal(t, acct.Balance(), 120)
}

func TestWithdrawingTooMuchFailsAndChangesNothing(t *testing.T) {
	acct := &Account{}
	acct.Deposit(10)
	err := acct.Withdraw(11)
	True(t, errors.Is(err, ErrInsufficient), "expected ErrInsufficient, got %v", err)
	Equal(t, acct.Balance(), 10)
	Equal(t, acct.Withdraw(10), nil)
	Equal(t, acct.Balance(), 0)
}
