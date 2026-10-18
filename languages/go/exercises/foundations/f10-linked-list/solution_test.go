package main

import "testing"

func chkNodes(head *Node) []*Node {
	var out []*Node
	for n := head; n != nil; n = n.Next {
		out = append(out, n)
	}
	return out
}

func TestPushFront(t *testing.T) {
	h := PushFront(FromSlice([]int{2, 3}), 1)
	Equal(t, ToSlice(h), []int{1, 2, 3})
	Equal(t, ToSlice(PushFront(nil, 5)), []int{5})
}

func TestPushFrontKeepsTheOldListIntact(t *testing.T) {
	old := FromSlice([]int{2, 3})
	h := PushFront(old, 1)
	True(t, h != old, "PushFront must return a new head node")
	True(t, h.Next == old, "the new node should point at the old head")
}

func TestReverse(t *testing.T) {
	Equal(t, ToSlice(Reverse(FromSlice([]int{1, 2, 3, 4}))), []int{4, 3, 2, 1})
	Equal(t, ToSlice(Reverse(FromSlice([]int{7}))), []int{7})
	True(t, Reverse(nil) == nil, "reversing the empty list gives the empty list")
}

func TestReverseReusesTheSameNodes(t *testing.T) {
	head := FromSlice([]int{1, 2, 3, 4})
	before := chkNodes(head)
	after := chkNodes(Reverse(head))
	Equal(t, len(after), 4)
	for i := range before {
		True(t, after[len(after)-1-i] == before[i], "node %d should be the same node, relinked, not a copy", i)
	}
	True(t, before[0].Next == nil, "the old head should now be the tail")
}

func TestReverseALongList(t *testing.T) {
	const n = 200000
	xs := make([]int, n)
	for i := range xs {
		xs[i] = i
	}
	r := Reverse(FromSlice(xs))
	Equal(t, r.Val, n-1)
	count := 0
	for p := r; p != nil; p = p.Next {
		count++
	}
	Equal(t, count, n)
}

func TestRemoveAllInTheMiddleAndAtTheEnds(t *testing.T) {
	Equal(t, ToSlice(RemoveAll(FromSlice([]int{1, 2, 3, 2, 4}), 2)), []int{1, 3, 4})
	Equal(t, ToSlice(RemoveAll(FromSlice([]int{5, 1, 2}), 5)), []int{1, 2})
	Equal(t, ToSlice(RemoveAll(FromSlice([]int{1, 2, 5}), 5)), []int{1, 2})
}

func TestRemoveAllHandlesRunsAndEverything(t *testing.T) {
	Equal(t, ToSlice(RemoveAll(FromSlice([]int{7, 7, 1, 7, 7, 7, 2, 7}), 7)), []int{1, 2})
	True(t, RemoveAll(FromSlice([]int{4, 4, 4}), 4) == nil, "removing everything leaves the empty list")
	True(t, RemoveAll(nil, 1) == nil, "removing from the empty list gives the empty list")
	Equal(t, ToSlice(RemoveAll(FromSlice([]int{1, 2, 3}), 9)), []int{1, 2, 3})
}

func TestRemoveAllKeepsTheSurvivingNodes(t *testing.T) {
	head := FromSlice([]int{1, 2, 3, 2, 4})
	nodes := chkNodes(head)
	got := chkNodes(RemoveAll(head, 2))
	want := []*Node{nodes[0], nodes[2], nodes[4]}
	Equal(t, len(got), len(want))
	for i := range want {
		True(t, got[i] == want[i], "survivor %d should be the original node, not a copy", i)
	}
}

func TestMiddle(t *testing.T) {
	for n := 1; n <= 7; n++ {
		xs := make([]int, n)
		for i := range xs {
			xs[i] = i + 1
		}
		head := FromSlice(xs)
		nodes := chkNodes(head)
		got := Middle(head)
		True(t, got == nodes[n/2], "for length %d expected node index %d (value %d), got %+v", n, n/2, xs[n/2], got)
	}
}

func TestMiddleOfTheEmptyList(t *testing.T) {
	True(t, Middle(nil) == nil, "expected nil")
}

func TestHasCycleOnPlainLists(t *testing.T) {
	False(t, HasCycle(nil))
	False(t, HasCycle(FromSlice([]int{1})))
	False(t, HasCycle(FromSlice([]int{1, 2, 3, 4, 5})))
}

func TestHasCycleDetectsLoops(t *testing.T) {
	loop := &Node{Val: 1}
	loop.Next = loop
	True(t, HasCycle(loop), "a node pointing at itself is a cycle")

	head := FromSlice([]int{1, 2, 3, 4, 5, 6})
	nodes := chkNodes(head)
	nodes[5].Next = nodes[2]
	True(t, HasCycle(head), "tail linked back to the middle")
	nodes[5].Next = nodes[0]
	True(t, HasCycle(head), "tail linked back to the head")
	nodes[5].Next = nil
	False(t, HasCycle(head), "after cutting the link there is no cycle")
}

func TestHasCycleOnALongList(t *testing.T) {
	const n = 300000
	xs := make([]int, n)
	head := FromSlice(xs)
	False(t, HasCycle(head))
	tail := head
	for tail.Next != nil {
		tail = tail.Next
	}
	tail.Next = head
	True(t, HasCycle(head))
}

func TestMergeSorted(t *testing.T) {
	got := MergeSorted(FromSlice([]int{1, 4, 7}), FromSlice([]int{2, 3, 9, 10}))
	Equal(t, ToSlice(got), []int{1, 2, 3, 4, 7, 9, 10})
}

func TestMergeSortedWithEmptyLists(t *testing.T) {
	Equal(t, ToSlice(MergeSorted(nil, FromSlice([]int{1, 2}))), []int{1, 2})
	Equal(t, ToSlice(MergeSorted(FromSlice([]int{3}), nil)), []int{3})
	True(t, MergeSorted(nil, nil) == nil, "merging two empty lists gives the empty list")
}

func TestMergeSortedRelinksAndIsStable(t *testing.T) {
	a := FromSlice([]int{1, 3})
	b := FromSlice([]int{1, 2})
	an, bn := chkNodes(a), chkNodes(b)
	got := chkNodes(MergeSorted(a, b))
	want := []*Node{an[0], bn[0], bn[1], an[1]}
	Equal(t, len(got), 4)
	for i := range want {
		True(t, got[i] == want[i], "position %d should hold the original node (a's node first on ties)", i)
	}
}
