def reverse_words(text: str) -> str:
    """The words of text in reverse order, single-spaced."""
    raise NotImplementedError


def is_palindrome(text: str) -> bool:
    """Same backwards, ignoring case and non-alphanumeric characters."""
    raise NotImplementedError


def initials(name: str) -> str:
    """'ada lovelace' -> 'A.L.'"""
    raise NotImplementedError


def mask_email(email: str) -> str:
    """'grace@navy.mil' -> 'g***@navy.mil'"""
    raise NotImplementedError


def slug(title: str) -> str:
    """'Hello, World! 2024' -> 'hello-world-2024'"""
    raise NotImplementedError


if __name__ == "__main__":
    s = "Python"
    print(s[0], s[-1], s[1:4], s[::-1])
    print("  a  b\tc ".split())
    print(reverse_words("hello big world"))
