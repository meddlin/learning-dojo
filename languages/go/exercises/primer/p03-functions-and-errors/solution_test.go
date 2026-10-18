package main

import (
	"errors"
	"strconv"
	"strings"
	"testing"
)

func TestDivide(t *testing.T) {
	q, err := Divide(7, 2)
	Equal(t, q, 3)
	Equal(t, err, nil)
}

func TestDivideByZeroReturnsTheSentinel(t *testing.T) {
	q, err := Divide(1, 0)
	Equal(t, q, 0)
	True(t, errors.Is(err, ErrDivideByZero), "expected ErrDivideByZero, got %v", err)
}

func TestMinMaxOfSeveralValues(t *testing.T) {
	lo, hi, err := MinMax(3, 1, 2)
	Equal(t, err, nil)
	Equal(t, lo, 1)
	Equal(t, hi, 3)
}

func TestMinMaxOfOneValueAndOfASlice(t *testing.T) {
	lo, hi, _ := MinMax(5)
	Equal(t, lo, 5)
	Equal(t, hi, 5)
	nums := []int{4, -2, 9, 0}
	lo, hi, err := MinMax(nums...)
	Equal(t, err, nil)
	Equal(t, lo, -2)
	Equal(t, hi, 9)
}

func TestMinMaxOfNothingIsAnError(t *testing.T) {
	_, _, err := MinMax()
	True(t, errors.Is(err, ErrEmpty), "expected ErrEmpty, got %v", err)
}

func TestParsePositive(t *testing.T) {
	n, err := ParsePositive("42")
	Equal(t, err, nil)
	Equal(t, n, 42)
}

func TestParsePositiveWrapsTheParseError(t *testing.T) {
	_, err := ParsePositive("abc")
	True(t, err != nil, "expected an error")
	var numErr *strconv.NumError
	True(t, errors.As(err, &numErr), "the error should wrap a *strconv.NumError (use %%w), got %v", err)
	True(t, strings.Contains(err.Error(), "abc"), "the error text should mention the input, got %q", err.Error())
}

func TestParsePositiveRejectsZeroAndNegatives(t *testing.T) {
	for _, s := range []string{"0", "-3"} {
		_, err := ParsePositive(s)
		True(t, errors.Is(err, ErrNotPositive), "ParsePositive(%q): expected ErrNotPositive, got %v", s, err)
		True(t, strings.Contains(err.Error(), s), "ParsePositive(%q): the error text should mention the input, got %q", s, err.Error())
	}
}

func TestTryReturnsNilWhenNothingGoesWrong(t *testing.T) {
	Equal(t, Try(func() {}), nil)
}

func TestTryTurnsAPanicIntoAnError(t *testing.T) {
	err := Try(func() { panic("boom") })
	True(t, err != nil, "expected an error")
	True(t, strings.Contains(err.Error(), "boom"), "error text %q should contain the panic value", err.Error())
}

func TestTryCatchesRuntimePanicsToo(t *testing.T) {
	err := Try(func() {
		var xs []int
		_ = xs[3]
	})
	True(t, err != nil, "expected an error")
	True(t, strings.Contains(err.Error(), "index out of range"), "error text %q should mention the index error", err.Error())
}

func TestDeferRunsLastInFirstOut(t *testing.T) {
	Equal(t, DeferOrder(), []string{"work", "third", "second", "first"})
}
