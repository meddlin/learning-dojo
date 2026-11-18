from collections import Counter, defaultdict


def letter_counts(text: str) -> dict[str, int]:
    return Counter(ch for ch in text.lower() if ch.isalpha())


def most_common_word(text: str) -> str:
    return Counter(text.lower().split()).most_common(1)[0][0]


def is_anagram(a: str, b: str) -> bool:
    def letters(s: str) -> Counter:
        return Counter(s.lower().replace(" ", ""))

    return letters(a) == letters(b)


def combine(*counts: dict[str, int]) -> dict[str, int]:
    total: Counter = Counter()
    for d in counts:
        total.update(d)
    return dict(total)


def index_words(lines: list[str]) -> dict[str, list[int]]:
    index: defaultdict[str, list[int]] = defaultdict(list)
    for line_no, line in enumerate(lines, start=1):
        for word in dict.fromkeys(line.lower().split()):
            index[word].append(line_no)
    return dict(index)


if __name__ == "__main__":
    print(Counter("mississippi").most_common(2))
    print(index_words(["a b", "b c"]))
