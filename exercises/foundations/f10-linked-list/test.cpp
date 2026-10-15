#define DOJO_TRACK_NEW
#include "dojo.h"
#include "solution.cpp"

TEST(push_front_builds_the_list_in_front) {
    dojo::AllocScope scope;
    ListNode* head = nullptr;
    head = push_front(head, 3);
    head = push_front(head, 2);
    head = push_front(head, 1);
    CHECK_EQ(to_vector(head), std::vector<int>{1, 2, 3});
    CHECK_EQ(scope.leaked_news(), 3);
    free_list(head);
}

TEST(reverse_list_basic) {
    ListNode* head = from_vector({1, 2, 3, 4});
    head = reverse_list(head);
    CHECK_EQ(to_vector(head), (std::vector<int>{4, 3, 2, 1}));
    free_list(head);
}

TEST(reverse_list_tiny_lists) {
    CHECK(reverse_list(nullptr) == nullptr);
    ListNode* one = from_vector({7});
    one = reverse_list(one);
    CHECK_EQ(to_vector(one), std::vector<int>{7});
    free_list(one);
}

TEST(reverse_list_reuses_the_nodes) {
    dojo::AllocScope scope;
    ListNode* head = from_vector({1, 2, 3, 4, 5});
    CHECK_EQ(scope.leaked_news(), 5);
    long before = scope.allocated_news();
    head = reverse_list(head);
    long extra = scope.allocated_news() - before;
    INFO("reverse_list must rewire the existing nodes, not allocate new ones");
    CHECK_EQ(extra, 0);
    free_list(head);
}

TEST(remove_value_removes_head_middle_and_tail) {
    ListNode* head = from_vector({7, 7, 1, 7, 2, 7});
    head = remove_value(head, 7);
    CHECK_EQ(to_vector(head), (std::vector<int>{1, 2}));
    free_list(head);
}

TEST(remove_value_deletes_the_removed_nodes) {
    dojo::AllocScope scope;
    ListNode* head = from_vector({1, 2, 1, 3, 1});
    head = remove_value(head, 1);
    long alive = scope.leaked_news();
    CHECK_EQ(to_vector(head), (std::vector<int>{2, 3}));
    INFO("the three removed nodes must be deleted, leaving two alive");
    CHECK_EQ(alive, 2);
    free_list(head);
}

TEST(remove_value_edge_cases) {
    ListNode* head = from_vector({4, 5});
    head = remove_value(head, 9);
    CHECK_EQ(to_vector(head), (std::vector<int>{4, 5}));
    free_list(head);

    ListNode* all = from_vector({3, 3, 3});
    all = remove_value(all, 3);
    CHECK(all == nullptr);

    CHECK(remove_value(nullptr, 1) == nullptr);
}

TEST(free_list_releases_every_node) {
    dojo::AllocScope scope;
    ListNode* head = nullptr;
    for (int i = 0; i < 100; ++i) head = push_front(head, i);
    CHECK_EQ(scope.leaked_news(), 100);
    free_list(head);
    CHECK_EQ(scope.leaked_news(), 0);
    free_list(nullptr);
}

int main() { return dojo::run_all(); }
