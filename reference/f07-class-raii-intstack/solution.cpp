#include <cstddef>
#include <iostream>
#include <stdexcept>

class IntStack {
public:
    IntStack() : data_(new int[2]), size_(0), capacity_(2) {}

    ~IntStack() { delete[] data_; }

    IntStack(const IntStack&) = delete;
    IntStack& operator=(const IntStack&) = delete;

    void push(int value) {
        if (size_ == capacity_) {
            std::size_t bigger_capacity = capacity_ * 2;
            int* bigger = new int[bigger_capacity];
            for (std::size_t i = 0; i < size_; ++i) bigger[i] = data_[i];
            delete[] data_;
            data_ = bigger;
            capacity_ = bigger_capacity;
        }
        data_[size_++] = value;
    }

    int pop() {
        if (size_ == 0) throw std::out_of_range("pop from empty stack");
        return data_[--size_];
    }

    int top() const {
        if (size_ == 0) throw std::out_of_range("top of empty stack");
        return data_[size_ - 1];
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
