package main

import (
	"errors"
	"fmt"
)

var ErrEmpty = errors.New("stack is empty")

type Stack[T any] struct {
	data []T
	size int
}

func NewStack[T any]() *Stack[T] {
	return &Stack[T]{data: make([]T, 2)}
}

func (s *Stack[T]) Push(v T) {
	if s.size == len(s.data) {
		newCap := max(2, 2*len(s.data))
		bigger := make([]T, newCap)
		copy(bigger, s.data)
		s.data = bigger
	}
	s.data[s.size] = v
	s.size++
}

func (s *Stack[T]) Pop() (T, error) {
	var zero T
	if s.size == 0 {
		return zero, ErrEmpty
	}
	s.size--
	v := s.data[s.size]
	s.data[s.size] = zero
	return v, nil
}

func (s *Stack[T]) Peek() (T, error) {
	var zero T
	if s.size == 0 {
		return zero, ErrEmpty
	}
	return s.data[s.size-1], nil
}

func (s *Stack[T]) Len() int { return s.size }

func (s *Stack[T]) Cap() int { return len(s.data) }

func main() {
	s := NewStack[string]()
	s.Push("a")
	s.Push("b")
	v, _ := s.Pop()
	fmt.Println(v, s.Len(), s.Cap())
}
