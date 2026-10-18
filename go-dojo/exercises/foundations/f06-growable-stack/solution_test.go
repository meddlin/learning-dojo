package main

import (
	"errors"
	"testing"
)

func chkBuffer[T any](s *Stack[T]) *T {
	if len(s.data) == 0 {
		return nil
	}
	return &s.data[0]
}

func TestStartsEmptyWithRoomForTwo(t *testing.T) {
	s := NewStack[int]()
	Equal(t, s.Len(), 0)
	Equal(t, s.Cap(), 2)
}

func TestLastInFirstOut(t *testing.T) {
	s := NewStack[int]()
	s.Push(1)
	s.Push(2)
	s.Push(3)
	Equal(t, s.Len(), 3)
	top, err := s.Peek()
	Equal(t, err, nil)
	Equal(t, top, 3)
	for _, want := range []int{3, 2, 1} {
		v, err := s.Pop()
		Equal(t, err, nil)
		Equal(t, v, want)
	}
	Equal(t, s.Len(), 0)
}

func TestValuesSurviveGrowth(t *testing.T) {
	s := NewStack[int]()
	for i := range 1000 {
		s.Push(i)
		top, _ := s.Peek()
		Equal(t, top, i)
	}
	Equal(t, s.Len(), 1000)
	True(t, s.Cap() >= 1000, "capacity %d should hold 1000 items", s.Cap())
	for i := 999; i >= 0; i-- {
		v, err := s.Pop()
		Equal(t, err, nil)
		Equal(t, v, i)
	}
}

func TestPopOnEmptyReturnsErrEmpty(t *testing.T) {
	s := NewStack[string]()
	v, err := s.Pop()
	True(t, errors.Is(err, ErrEmpty), "expected ErrEmpty, got %v", err)
	Equal(t, v, "")
}

func TestPeekOnEmptyReturnsErrEmpty(t *testing.T) {
	s := NewStack[int]()
	_, err := s.Peek()
	True(t, errors.Is(err, ErrEmpty), "expected ErrEmpty, got %v", err)
	s.Push(5)
	s.Pop()
	_, err = s.Peek()
	True(t, errors.Is(err, ErrEmpty), "expected ErrEmpty after popping the last item, got %v", err)
}

func TestWorksForAnyElementType(t *testing.T) {
	s := NewStack[string]()
	s.Push("go")
	s.Push("dojo")
	v, _ := s.Pop()
	Equal(t, v, "dojo")
	type pair struct{ a, b int }
	p := NewStack[pair]()
	p.Push(pair{1, 2})
	got, _ := p.Pop()
	Equal(t, got, pair{1, 2})
}

func TestTheZeroValueStackIsUsable(t *testing.T) {
	var s Stack[int]
	for i := range 50 {
		s.Push(i)
	}
	Equal(t, s.Len(), 50)
	v, err := s.Pop()
	Equal(t, err, nil)
	Equal(t, v, 49)
}

func TestGrowthDoubles(t *testing.T) {
	s := NewStack[int]()
	s.Push(1)
	s.Push(2)
	Equal(t, s.Cap(), 2)
	s.Push(3)
	Equal(t, s.Cap(), 4)
	s.Push(4)
	s.Push(5)
	Equal(t, s.Cap(), 8)
}

func TestGrowthIsGeometric(t *testing.T) {
	s := NewStack[int]()
	reallocations := 0
	last := chkBuffer(s)
	for i := range 1000 {
		s.Push(i)
		if now := chkBuffer(s); now != last {
			reallocations++
			last = now
		}
	}
	True(t, reallocations <= 12, "allocating a new buffer on almost every push is O(n^2): saw %d reallocations for 1000 pushes, double the capacity instead", reallocations)
}

func TestPoppingDoesNotShrinkOrReallocate(t *testing.T) {
	s := NewStack[int]()
	for i := range 100 {
		s.Push(i)
	}
	capBefore, buf := s.Cap(), chkBuffer(s)
	for range 100 {
		s.Pop()
	}
	Equal(t, s.Cap(), capBefore)
	True(t, chkBuffer(s) == buf, "pop should not reallocate the buffer")
}

func TestPopClearsTheVacatedSlot(t *testing.T) {
	s := NewStack[*int]()
	x := 7
	s.Push(&x)
	s.Pop()
	True(t, s.data[0] == nil, "the popped slot still holds a pointer, so the garbage collector cannot free its target: set it to the zero value")
}
