# Classes and dataclasses

## Concept

```python
class Dog:
    species = "canis familiaris"         # class attribute, shared by all dogs

    def __init__(self, name, age=0):     # the initialiser; self is the new object
        self.name = name                 # instance attributes
        self.age = age

    def birthday(self):                  # a method: always takes self first
        self.age += 1

    def __repr__(self):                  # what repr() and the REPL show
        return f"Dog({self.name!r}, {self.age})"

rex = Dog("Rex", 3)
rex.birthday()                           # Dog.birthday(rex)
```

There is no `private`: a leading underscore (`self._balance`) means "internal, please don't touch". To expose a value **read-only**, use a property:

```python
    @property
    def balance(self):
        return self._balance             # account.balance works; assigning raises AttributeError
```

Special "dunder" methods make your objects work with operators and built-ins: `__eq__` for `==`, `__add__` for `+`, `__mul__` for `*`, `__len__` for `len()`, `__str__` for `str()`.

A `@classmethod` receives the class instead of an instance; it is the usual way to write alternative constructors (`Vector.from_tuple(...)`).

For classes that mostly hold data, **dataclasses** write `__init__`, `__repr__` and `__eq__` for you:

```python
from dataclasses import dataclass

@dataclass(frozen=True)          # frozen: fields cannot be reassigned, and it is hashable
class Point:
    x: float
    y: float = 0.0

Point(1, 2) == Point(1, 2)       # True
```

## Your task

Implement in `solution.py`:

1. `BankAccount(owner, balance=0)`:
   - `owner` attribute; `balance` is a **read-only property**.
   - `deposit(amount)` and `withdraw(amount)`: raise `ValueError` for amounts `<= 0`, and `withdraw` also raises `ValueError` when the amount is more than the balance. Each successful call appends `("deposit", amount)` or `("withdraw", amount)` to the `history` list attribute.
   - `repr(account)` is `"BankAccount('ada', 50)"`.
2. The frozen dataclass `Vector(x, y)` is declared for you. Add:
   - `v + w` adds component-wise, and `v * k` scales by a number;
   - `v.length()`: the Euclidean length;
   - `Vector.from_tuple((3, 4))`: a classmethod constructor.
