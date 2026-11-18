from collections import Counter, defaultdict


def letter_counts(text: str) -> dict[str, int]:
    raise NotImplementedError


def most_common_word(text: str) -> str:
    raise NotImplementedError


def is_anagram(a: str, b: str) -> bool:
    raise NotImplementedError


def combine(*counts: dict[str, int]) -> dict[str, int]:
    raise NotImplementedError


def index_words(lines: list[str]) -> dict[str, list[int]]:
    raise NotImplementedError


if __name__ == "__main__":
    print(Counter("mississippi").most_common(2))
