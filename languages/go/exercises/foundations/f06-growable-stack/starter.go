package main

import (
	"errors"
	"fmt"
)

// ErrEmpty is returned by Pop and Peek on an empty stack.
var ErrEmpty = errors.New("stack is empty")

// Stack is a growable LIFO stack that owns its backing buffer.
//
//	data  the whole buffer: len(data) is the capacity
//	size  how many slots are in use (0 <= size <= len(data))
type Stack[T any] struct {
	data []T
	size int
}

// NewStack returns an empty stack whose buffer has room for 2 items.
func NewStack[T any]() *Stack[T] {
	return &Stack[T]{} // TODO
}

// Push adds v on top. When the buffer is full, double it first (make + copy).
// It must also work on a zero-value Stack whose data is nil.
func (s *Stack[T]) Push(v T) {
	// TODO
}

// Pop removes and returns the top element, or the zero value and ErrEmpty.
// Clear the vacated slot so the garbage collector can free what it held.
func (s *Stack[T]) Pop() (T, error) {
	var zero T
	return zero, nil // TODO
}

// Peek returns the top element without removing it, or the zero value and ErrEmpty.
func (s *Stack[T]) Peek() (T, error) {
	var zero T
	return zero, nil // TODO
}

// Len returns the number of items.
func (s *Stack[T]) Len() int { return s.size }

// Cap returns the size of the backing buffer.
func (s *Stack[T]) Cap() int { return len(s.data) }

func main() {
	s := NewStack[string]()
	s.Push("a")
	s.Push("b")
	v, _ := s.Pop()
	fmt.Println(v, s.Len(), s.Cap())
}
