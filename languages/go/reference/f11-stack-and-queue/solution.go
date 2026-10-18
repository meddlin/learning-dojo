package main

import (
	"errors"
	"fmt"
	"strconv"
)

var (
	ErrMalformed = errors.New("malformed expression")
	ErrDivByZero = errors.New("division by zero")
)

func BalancedBrackets(s string) bool {
	closer := map[rune]rune{'(': ')', '[': ']', '{': '}'}
	var stack []rune
	for _, r := range s {
		if c, ok := closer[r]; ok {
			stack = append(stack, c)
			continue
		}
		if r == ')' || r == ']' || r == '}' {
			if len(stack) == 0 || stack[len(stack)-1] != r {
				return false
			}
			stack = stack[:len(stack)-1]
		}
	}
	return len(stack) == 0
}

func EvalRPN(tokens []string) (int, error) {
	var stack []int
	for _, tok := range tokens {
		switch tok {
		case "+", "-", "*", "/":
			if len(stack) < 2 {
				return 0, ErrMalformed
			}
			a, b := stack[len(stack)-2], stack[len(stack)-1]
			stack = stack[:len(stack)-2]
			var r int
			switch tok {
			case "+":
				r = a + b
			case "-":
				r = a - b
			case "*":
				r = a * b
			case "/":
				if b == 0 {
					return 0, ErrDivByZero
				}
				r = a / b
			}
			stack = append(stack, r)
		default:
			n, err := strconv.Atoi(tok)
			if err != nil {
				return 0, ErrMalformed
			}
			stack = append(stack, n)
		}
	}
	if len(stack) != 1 {
		return 0, ErrMalformed
	}
	return stack[0], nil
}

func LastSurvivor(n, k int) int {
	queue := make([]int, n)
	for i := range queue {
		queue[i] = i + 1
	}
	for len(queue) > 1 {
		for range k - 1 {
			queue = append(queue[1:], queue[0])
		}
		queue = queue[1:]
	}
	return queue[0]
}

type MinStack struct {
	vals []int
	mins []int
}

func (s *MinStack) Push(v int) {
	m := v
	if len(s.mins) > 0 {
		m = min(v, s.mins[len(s.mins)-1])
	}
	s.vals = append(s.vals, v)
	s.mins = append(s.mins, m)
}

func (s *MinStack) Pop() (int, bool) {
	if len(s.vals) == 0 {
		return 0, false
	}
	v := s.vals[len(s.vals)-1]
	s.vals = s.vals[:len(s.vals)-1]
	s.mins = s.mins[:len(s.mins)-1]
	return v, true
}

func (s *MinStack) Min() (int, bool) {
	if len(s.mins) == 0 {
		return 0, false
	}
	return s.mins[len(s.mins)-1], true
}

func (s *MinStack) Len() int { return len(s.vals) }

func main() {
	fmt.Println(BalancedBrackets("([]{})"))
}
