#include <iostream>
#include <vector>

struct ListNode {
    int value;
    ListNode* next;
};

// Allocate a new node holding `value` in front of `head`. Return it as the new head.
ListNode* push_front(ListNode* head, int value) {
    return head;  // TODO
}

// Reverse the list by rewiring the next pointers. Do not allocate. Return the new head.
ListNode* reverse_list(ListNode* head) {
    return head;  // TODO
}

// Delete every node whose value equals target. Return the (possibly new) head.
ListNode* remove_value(ListNode* head, int target) {
    return head;  // TODO
}

// Delete every node in the list.
void free_list(ListNode* head) {
    // TODO
}

// ---------------------------------------------------------------------------
// Helpers (already written): handy for experiments in main() and used by the tests.
// ---------------------------------------------------------------------------

ListNode* from_vector(const std::vector<int>& values) {
    ListNode* head = nullptr;
    for (auto it = values.rbegin(); it != values.rend(); ++it) head = push_front(head, *it);
    return head;
}

std::vector<int> to_vector(const ListNode* head) {
    std::vector<int> out;
    for (const ListNode* n = head; n != nullptr; n = n->next) out.push_back(n->value);
    return out;
}

#ifndef DOJO_TEST
int main() {
    ListNode* list = from_vector({1, 2, 3});
    list = reverse_list(list);
    for (int x : to_vector(list)) std::cout << x << " ";
    std::cout << "\n";
    free_list(list);
}
#endif
