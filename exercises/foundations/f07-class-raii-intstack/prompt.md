# Classes, new/delete and RAII

## Concept

`new` allocates an object on the heap and runs its constructor; `delete` runs the destructor and frees the memory. The array forms are separate: `new int[n]` pairs with `delete[]`.

```cpp
int* p = new int(5);    delete p;
int* a = new int[10];   delete[] a;    // []: the array form, always
```

Calling `delete` by hand is error-prone, so C++ programmers lean on **RAII** (Resource Acquisition Is Initialisation): a class acquires its resource in its **constructor** and releases it in its **destructor**. The destructor runs automatically when the object goes out of scope, even if an exception flies past. Callers can no longer forget to free.

```cpp
{
    IntStack s;       // constructor allocates
    s.push(1);
}                     // destructor runs here: memory released
```

One trap: if you copy an object that owns raw memory, the default copy duplicates the *pointer*, so two objects own one array and both destructors free it (a double free). The tidy answer for this exercise is to **forbid copying** with `= delete`, which the starter already does. (`std::vector` solves it by implementing a proper deep copy, as you will see.)

Finally, errors that cannot be handled locally are reported by throwing an exception: `throw std::out_of_range("message");`. The caller can `catch` it.

## Your task

Complete `IntStack` in `solution.cpp`. It stores its ints in a heap array `data_` with room for `capacity_` ints, of which `size_` are in use.

- Constructor: start with capacity 2.
- Destructor: free the array.
- `push(int)`: if the array is full, **double** the capacity (allocate a bigger array, copy, free the old one), then store the value.
- `pop()`: remove and return the top element. Throw `std::out_of_range` if empty.
- `top() const`: return the top element without removing it. Throw `std::out_of_range` if empty.

The tests check ordering, growth, exception behaviour, that the destructor frees everything, that growth does not leak the old arrays, and that you grow geometrically (doubling) rather than one slot at a time.
