from dojo_test import equal, near, raises, true
from solution import BankAccount, Vector


def test_new_account():
    account = BankAccount("ada")
    equal(account.owner, "ada")
    equal(account.balance, 0)
    equal(account.history, [])
    equal(BankAccount("grace", 25).balance, 25)


def test_deposit_and_withdraw():
    account = BankAccount("ada", 10)
    account.deposit(50)
    account.withdraw(20)
    equal(account.balance, 40)
    equal(account.history, [("deposit", 50), ("withdraw", 20)])


def test_bad_amounts_are_rejected_and_change_nothing():
    account = BankAccount("ada", 10)
    raises(ValueError, account.deposit, 0)
    raises(ValueError, account.withdraw, -1)
    raises(ValueError, account.withdraw, 11)
    equal(account.balance, 10)
    equal(account.history, [])


def test_balance_is_read_only():
    account = BankAccount("ada", 10)

    def assign():
        account.balance = 1_000_000

    raises(AttributeError, assign)


def test_accounts_do_not_share_history():
    a = BankAccount("a")
    b = BankAccount("b")
    a.deposit(1)
    equal(b.history, [])


def test_account_repr():
    equal(repr(BankAccount("ada", 50)), "BankAccount('ada', 50)")


def test_vector_add_and_scale():
    equal(Vector(1, 2) + Vector(3, 4), Vector(4, 6))
    equal(Vector(1, -2) * 3, Vector(3, -6))


def test_vector_length():
    near(Vector(3, 4).length(), 5.0)
    near(Vector(0, 0).length(), 0.0)


def test_vector_from_tuple():
    v = Vector.from_tuple((3, 4))
    true(isinstance(v, Vector))
    equal(v, Vector(3, 4))


def test_vector_is_frozen():
    def assign():
        Vector(1, 2).x = 5

    raises(AttributeError, assign)
