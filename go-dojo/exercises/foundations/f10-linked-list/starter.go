package main

import "fmt"

// Node is one element of a singly linked list.
type Node struct {
	Val  int
	Next *Node
}

// FromSlice builds a list holding xs in order. (Provided.)
func FromSlice(xs []int) *Node {
	var head *Node
	for i := len(xs) - 1; i >= 0; i-- {
		head = &Node{Val: xs[i], Next: head}
	}
	return head
}

// ToSlice lists the values from head to the end. (Provided; do not use it on a cycle.)
func ToSlice(head *Node) []int {
	var out []int
	for n := head; n != nil; n = n.Next {
		out = append(out, n.Val)
	}
	return out
}

// PushFront puts a new node holding v in front of the list and returns it as the new head.
func PushFront(head *Node, v int) *Node {
	return head // TODO
}

// Reverse reverses the list by rewiring Next pointers (no new nodes) and returns the new head.
func Reverse(head *Node) *Node {
	return head // TODO
}

// RemoveAll unlinks every node whose value is target and returns the (possibly new) head.
func RemoveAll(head *Node, target int) *Node {
	return head // TODO
}

// Middle returns the middle node (the second of the two middle ones for an even
// length), or nil for the empty list.
func Middle(head *Node) *Node {
	return nil // TODO
}

// HasCycle reports whether following Next ever loops back. Use O(1) extra memory.
func HasCycle(head *Node) bool {
	return false // TODO
}

// MergeSorted merges two ascending lists by relinking the existing nodes.
// On equal values the node from a comes first.
func MergeSorted(a, b *Node) *Node {
	return nil // TODO
}

func main() {
	list := FromSlice([]int{1, 2, 3})
	fmt.Println(ToSlice(Reverse(list)))
}
