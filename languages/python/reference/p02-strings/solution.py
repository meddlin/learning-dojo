def reverse_words(text: str) -> str:
    """The words of text in reverse order, single-spaced."""
    return " ".join(reversed(text.split()))


def is_palindrome(text: str) -> bool:
    """Same backwards, ignoring case and non-alphanumeric characters."""
    cleaned = "".join(ch.lower() for ch in text if ch.isalnum())
    return cleaned == cleaned[::-1]


def initials(name: str) -> str:
    """'ada lovelace' -> 'A.L.'"""
    return "".join(word[0].upper() + "." for word in name.split())


def mask_email(email: str) -> str:
    """'grace@navy.mil' -> 'g***@navy.mil'"""
    local, _, domain = email.partition("@")
    return f"{local[0]}***@{domain}"


def slug(title: str) -> str:
    """'Hello, World! 2024' -> 'hello-world-2024'"""
    cleaned = "".join(ch if ch.isalnum() else " " for ch in title.lower())
    return "-".join(cleaned.split())


if __name__ == "__main__":
    s = "Python"
    print(s[0], s[-1], s[1:4], s[::-1])
    print("  a  b\tc ".split())
    print(reverse_words("hello big world"))
    print(slug("Hello, World! 2024"))
