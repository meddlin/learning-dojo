# A singly linked list

## Concept

A linked list stores each element in its own heap-allocated **node** that points to the next one. The last node's `next` is `nullptr`.

```cpp
struct ListNode {
    int value;
    ListNode* next;      // a struct may hold a pointer to its own type
};

ListNode* head = new ListNode{1, new ListNode{2, nullptr}};   // 1 -> 2
```

Lists are the standard way to practise pointer manipulation because every operation is "rewire some `next` pointers, in the right order". The two big dangers:

- **Losing the rest of the list.** If you overwrite `node->next` before saving it, everything behind is unreachable (and leaked).
- **Dangling pointers.** After `delete node;` the memory is gone. Reading `node->next` afterwards is use-after-free. Always save what you still need first.

Because the nodes come from `new`, someone has to `delete` them. Here you do it by hand; later you will see how `std::unique_ptr` and containers automate it.

## Your task

Implement these in `solution.cpp`. `from_vector` and `to_vector` are provided so you can build and inspect lists.

1. `ListNode* push_front(ListNode* head, int value)`: allocate a new node in front of the list and return it as the new head.
2. `ListNode* reverse_list(ListNode* head)`: reverse the list by rewiring `next` pointers. **Do not allocate** new nodes. Return the new head.
3. `ListNode* remove_value(ListNode* head, int target)`: delete every node whose value is `target`, and return the (possibly new) head.
4. `void free_list(ListNode* head)`: delete every node.

The tests count allocations: a leaked node, a double delete, or a use-after-free will fail them.
