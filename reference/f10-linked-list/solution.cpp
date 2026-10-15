#include <iostream>
#include <vector>

struct ListNode {
    int value;
    ListNode* next;
};

ListNode* push_front(ListNode* head, int value) {
    return new ListNode{value, head};
}

ListNode* reverse_list(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr != nullptr) {
        ListNode* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

ListNode* remove_value(ListNode* head, int target) {
    ListNode** link = &head;
    while (*link != nullptr) {
        if ((*link)->value == target) {
            ListNode* dead = *link;
            *link = dead->next;
            delete dead;
        } else {
            link = &(*link)->next;
        }
    }
    return head;
}

void free_list(ListNode* head) {
    while (head != nullptr) {
        ListNode* next = head->next;
        delete head;
        head = next;
    }
}

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
