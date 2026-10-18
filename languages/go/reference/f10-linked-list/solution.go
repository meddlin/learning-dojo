package main

import "fmt"

type Node struct {
	Val  int
	Next *Node
}

func FromSlice(xs []int) *Node {
	var head *Node
	for i := len(xs) - 1; i >= 0; i-- {
		head = &Node{Val: xs[i], Next: head}
	}
	return head
}

func ToSlice(head *Node) []int {
	var out []int
	for n := head; n != nil; n = n.Next {
		out = append(out, n.Val)
	}
	return out
}

func PushFront(head *Node, v int) *Node {
	return &Node{Val: v, Next: head}
}

func Reverse(head *Node) *Node {
	var prev *Node
	for cur := head; cur != nil; {
		next := cur.Next
		cur.Next = prev
		prev, cur = cur, next
	}
	return prev
}

func RemoveAll(head *Node, target int) *Node {
	dummy := &Node{Next: head}
	for p := dummy; p.Next != nil; {
		if p.Next.Val == target {
			p.Next = p.Next.Next
		} else {
			p = p.Next
		}
	}
	return dummy.Next
}

func Middle(head *Node) *Node {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
	}
	return slow
}

func HasCycle(head *Node) bool {
	slow, fast := head, head
	for fast != nil && fast.Next != nil {
		slow = slow.Next
		fast = fast.Next.Next
		if slow == fast {
			return true
		}
	}
	return false
}

func MergeSorted(a, b *Node) *Node {
	dummy := &Node{}
	tail := dummy
	for a != nil && b != nil {
		if a.Val <= b.Val {
			tail.Next, a = a, a.Next
		} else {
			tail.Next, b = b, b.Next
		}
		tail = tail.Next
	}
	if a != nil {
		tail.Next = a
	} else {
		tail.Next = b
	}
	return dummy.Next
}

func main() {
	list := FromSlice([]int{1, 2, 3})
	fmt.Println(ToSlice(Reverse(list)))
}
