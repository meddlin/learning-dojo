#include <iostream>
#include <queue>
#include <stack>
#include <string>
#include <vector>

// True if every (, [ and { is closed by the matching bracket, in the right order.
// Other characters are ignored. "" is balanced.
bool balanced_brackets(const std::string& s) {
    return false;  // TODO
}

// Evaluate a Reverse Polish Notation expression. Tokens are integers (maybe negative,
// like "-11") or one of + - * /. Division truncates toward zero.
// {"2", "1", "+", "3", "*"} -> 9
int evaluate_rpn(const std::vector<std::string>& tokens) {
    return 0;  // TODO
}

// n people stand in a circle, numbered 1..n. Starting at person 1, count k people and
// remove the k-th; keep counting from the next person. Return the last person left.
// Use a std::queue.
int last_survivor(int n, int k) {
    return 0;  // TODO
}

#ifndef DOJO_TEST
int main() {
    std::cout << (balanced_brackets("([]{})") ? "balanced" : "not balanced") << "\n";
}
#endif
