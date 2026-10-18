package main

import (
	"errors"
	"fmt"
)

var (
	ErrMalformed = errors.New("malformed expression")
	ErrDivByZero = errors.New("division by zero")
)

// BalancedBrackets reports whether every (, [ and { is closed by the matching
// bracket in the right order. Other characters are ignored.
func BalancedBrackets(s string) bool {
	return false // TODO
}

// EvalRPN evaluates a postfix expression of integers and + - * /.
// Division truncates toward zero. Returns ErrMalformed for an unknown token, too
// few operands or leftover operands, and ErrDivByZero for division by zero.
func EvalRPN(tokens []string) (int, error) {
	return 0, nil // TODO
}

// LastSurvivor: n people in a circle numbered 1..n; starting at person 1, count k
// and remove the k-th, continuing from the next person, until one is left.
// Return that person's number. Use a queue.
func LastSurvivor(n, k int) int {
	return -1 // TODO
}

// MinStack is a stack of ints that can report its minimum in O(1).
// The zero value is an empty stack.
type MinStack struct {
	vals []int
	mins []int // mins[i] is the minimum of vals[:i+1]
}

// Push adds v on top.
func (s *MinStack) Push(v int) {
	// TODO
}

// Pop removes and returns the top value; false if the stack is empty.
func (s *MinStack) Pop() (int, bool) {
	return 0, false // TODO
}

// Min returns the smallest value in the stack; false if it is empty.
func (s *MinStack) Min() (int, bool) {
	return 0, false // TODO
}

// Len returns the number of values.
func (s *MinStack) Len() int { return len(s.vals) }

func main() {
	fmt.Println(BalancedBrackets("([]{})"))
}
