# Linked lists

## Concept

A singly linked list is a chain of nodes, each holding a value and a pointer to the next one. The list is just a pointer to its first node (the **head**); the empty list is `nil`.

```go
type Node struct {
	Val  int
	Next *Node
}

// 1 -> 2 -> 3
head := &Node{1, &Node{2, &Node{3, nil}}}
for n := head; n != nil; n = n.Next {
	fmt.Println(n.Val)
}
```

Inserting at the front is O(1); reaching the middle is O(n). Compared with a slice you give up random access and cache friendliness, and you gain O(1) splicing. (In practice a slice is almost always faster, but linked structures are how trees, graphs, LRU caches and many interview questions work.)

Go simplifies the C version: there is **no `free`**. When nothing points at a node any more the garbage collector reclaims it, so "remove a node" just means "stop pointing at it". The danger that remains is the **nil dereference**: `n.Next.Val` panics when `n.Next` is nil, so check before you follow a pointer.

Three techniques cover most list problems:

- **Rewiring**: change `Next` pointers instead of copying values. Reversing a list needs three variables (`prev`, `cur`, `next`).
- **A dummy head**: a throwaway node placed before the real head so that "operate on the head" is no longer a special case.
- **Slow and fast pointers**: one pointer moves one step at a time, the other two. When the fast one reaches the end, the slow one is in the middle. If there is a cycle, the fast one eventually laps the slow one and they meet (Floyd's algorithm), in O(n) time and O(1) memory.

## Your task

`Node`, `FromSlice` and `ToSlice` are provided so you can build and inspect lists. Implement in `solution.go`:

1. `PushFront(head *Node, v int) *Node`: a new node holding `v` in front of the list; return it as the new head.
2. `Reverse(head *Node) *Node`: reverse the list by rewiring `Next` pointers. **Do not allocate** new nodes: the tests check that the same nodes come back. Return the new head.
3. `RemoveAll(head *Node, target int) *Node`: unlink every node whose value is `target`; return the (possibly new) head. The other nodes must stay the same nodes.
4. `Middle(head *Node) *Node`: the middle node (the second of the two middle nodes when the length is even), or nil for the empty list. One pass with slow and fast pointers.
5. `HasCycle(head *Node) bool`: does following `Next` ever loop back? O(1) extra memory.
6. `MergeSorted(a, b *Node) *Node`: merge two ascending lists into one ascending list **by relinking the existing nodes**; on equal values the node from `a` comes first.
