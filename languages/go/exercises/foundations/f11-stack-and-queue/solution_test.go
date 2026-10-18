package main

import (
	"errors"
	"strings"
	"testing"
)

func TestBalancedBrackets(t *testing.T) {
	True(t, BalancedBrackets("()"))
	True(t, BalancedBrackets("([]{})"))
	True(t, BalancedBrackets("{[()()]}"))
	True(t, BalancedBrackets(""))
}

func TestUnbalancedBrackets(t *testing.T) {
	False(t, BalancedBrackets("("))
	False(t, BalancedBrackets(")"))
	False(t, BalancedBrackets("(]"))
	False(t, BalancedBrackets("([)]"))
	False(t, BalancedBrackets("((())"))
	False(t, BalancedBrackets("())("))
}

func TestBracketsIgnoreOtherCharacters(t *testing.T) {
	True(t, BalancedBrackets("f(x[i]) + {y}"))
	False(t, BalancedBrackets("f(x[i) + {y}"))
	True(t, BalancedBrackets("no brackets at all"))
}

func TestVeryDeepNesting(t *testing.T) {
	const n = 100000
	deep := strings.Repeat("(", n) + strings.Repeat(")", n)
	True(t, BalancedBrackets(deep))
	False(t, BalancedBrackets(deep+")"))
}

func TestRPNBasics(t *testing.T) {
	v, err := EvalRPN([]string{"2", "1", "+", "3", "*"})
	Equal(t, err, nil)
	Equal(t, v, 9)
	v, err = EvalRPN([]string{"4", "13", "5", "/", "+"})
	Equal(t, err, nil)
	Equal(t, v, 6)
}

func TestRPNLongerExpression(t *testing.T) {
	tokens := []string{"10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"}
	v, err := EvalRPN(tokens)
	Equal(t, err, nil)
	Equal(t, v, 22)
}

func TestRPNNegativeNumbersAndTruncatingDivision(t *testing.T) {
	v, _ := EvalRPN([]string{"-3", "4", "+"})
	Equal(t, v, 1)
	v, _ = EvalRPN([]string{"7", "-2", "/"})
	Equal(t, v, -3)
	v, _ = EvalRPN([]string{"-7", "2", "/"})
	Equal(t, v, -3)
}

func TestRPNOperandOrder(t *testing.T) {
	v, _ := EvalRPN([]string{"10", "3", "-"})
	Equal(t, v, 7)
	v, _ = EvalRPN([]string{"20", "4", "/"})
	Equal(t, v, 5)
}

func TestRPNSingleNumber(t *testing.T) {
	v, err := EvalRPN([]string{"42"})
	Equal(t, err, nil)
	Equal(t, v, 42)
}

func TestRPNMalformedInput(t *testing.T) {
	cases := [][]string{
		nil,
		{"+"},
		{"1", "+"},
		{"1", "2"},
		{"1", "x", "+"},
		{"1", "2", "3", "+"},
	}
	for _, tokens := range cases {
		_, err := EvalRPN(tokens)
		True(t, errors.Is(err, ErrMalformed), "EvalRPN(%q): expected ErrMalformed, got %v", tokens, err)
	}
}

func TestRPNDivisionByZero(t *testing.T) {
	_, err := EvalRPN([]string{"1", "0", "/"})
	True(t, errors.Is(err, ErrDivByZero), "expected ErrDivByZero, got %v", err)
}

func chkJosephus(n, k int) int {
	pos := 0
	for i := 2; i <= n; i++ {
		pos = (pos + k) % i
	}
	return pos + 1
}

func TestLastSurvivorKnownValues(t *testing.T) {
	Equal(t, LastSurvivor(1, 5), 1)
	Equal(t, LastSurvivor(5, 2), 3)
	Equal(t, LastSurvivor(7, 3), 4)
	Equal(t, LastSurvivor(41, 3), 31)
	Equal(t, LastSurvivor(10, 1), 10)
}

func TestLastSurvivorMatchesTheRecurrence(t *testing.T) {
	for n := 1; n <= 60; n++ {
		for k := 1; k <= 8; k++ {
			Equal(t, LastSurvivor(n, k), chkJosephus(n, k), "n = %d, k = %d", n, k)
		}
	}
}

func TestMinStackTracksTheMinimum(t *testing.T) {
	var s MinStack
	for _, v := range []int{5, 3, 7, 3, 1, 8} {
		s.Push(v)
	}
	Equal(t, s.Len(), 6)
	m, ok := s.Min()
	True(t, ok)
	Equal(t, m, 1)
	v, ok := s.Pop()
	True(t, ok)
	Equal(t, v, 8)
	m, _ = s.Min()
	Equal(t, m, 1)
	s.Pop()
	m, _ = s.Min()
	Equal(t, m, 3, "after popping the 1")
	s.Pop()
	m, _ = s.Min()
	Equal(t, m, 3, "the other 3 is still there")
	s.Pop()
	m, _ = s.Min()
	Equal(t, m, 3)
	s.Pop()
	m, _ = s.Min()
	Equal(t, m, 5)
}

func TestMinStackOnEmpty(t *testing.T) {
	var s MinStack
	_, ok := s.Min()
	False(t, ok)
	_, ok = s.Pop()
	False(t, ok)
	s.Push(2)
	s.Pop()
	_, ok = s.Min()
	False(t, ok)
	Equal(t, s.Len(), 0)
}

func TestMinStackWithNegativesAndRepeats(t *testing.T) {
	var s MinStack
	s.Push(-2)
	s.Push(0)
	s.Push(-3)
	m, _ := s.Min()
	Equal(t, m, -3)
	s.Pop()
	m, _ = s.Min()
	Equal(t, m, -2)
}
