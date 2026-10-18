#include <iostream>
#include <queue>
#include <stack>
#include <string>
#include <vector>

bool balanced_brackets(const std::string& s) {
    std::stack<char> open;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            open.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (open.empty()) return false;
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (open.top() != want) return false;
            open.pop();
        }
    }
    return open.empty();
}

int evaluate_rpn(const std::vector<std::string>& tokens) {
    std::stack<int> values;
    for (const std::string& t : tokens) {
        bool is_number = t.size() > 1 || (t[0] >= '0' && t[0] <= '9');
        if (is_number) {
            values.push(std::stoi(t));
            continue;
        }
        int b = values.top();
        values.pop();
        int a = values.top();
        values.pop();
        switch (t[0]) {
            case '+': values.push(a + b); break;
            case '-': values.push(a - b); break;
            case '*': values.push(a * b); break;
            case '/': values.push(a / b); break;
        }
    }
    return values.top();
}

int last_survivor(int n, int k) {
    std::queue<int> q;
    for (int i = 1; i <= n; ++i) q.push(i);
    while (q.size() > 1) {
        for (int i = 0; i < k - 1; ++i) {
            q.push(q.front());
            q.pop();
        }
        q.pop();
    }
    return q.front();
}

#ifndef DOJO_TEST
int main() {
    std::cout << (balanced_brackets("([]{})") ? "balanced" : "not balanced") << "\n";
}
#endif
