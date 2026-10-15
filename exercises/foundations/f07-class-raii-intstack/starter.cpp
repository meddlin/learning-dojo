#include <cstddef>
#include <iostream>
#include <stdexcept>

// A stack of ints that owns a heap array and grows when it fills up.
//
//   data_      points to an array of capacity_ ints, allocated with new[]
//   size_      how many of them are in use (0 <= size_ <= capacity_)
class IntStack {
public:
    IntStack() {
        // TODO: allocate room for 2 ints
    }

    ~IntStack() {
        // TODO: release the array
    }

    // Copying would make two stacks share one array and free it twice. Forbid it.
    IntStack(const IntStack&) = delete;
    IntStack& operator=(const IntStack&) = delete;

    // Add value on top. When the array is full, double its capacity first.
    void push(int value) {
        // TODO
    }

    // Remove and return the top element. Throw std::out_of_range if the stack is empty.
    int pop() {
        return 0;  // TODO
    }

    // Return the top element without removing it. Throw std::out_of_range if empty.
    int top() const {
        return 0;  // TODO
    }

    std::size_t size() const { return size_; }
    std::size_t capacity() const { return capacity_; }
    bool empty() const { return size_ == 0; }

private:
    int* data_ = nullptr;
    std::size_t size_ = 0;
    std::size_t capacity_ = 0;
};

#ifndef DOJO_TEST
int main() {
    IntStack s;
    s.push(1);
    s.push(2);
    std::cout << s.pop() << "\n";
}
#endif
