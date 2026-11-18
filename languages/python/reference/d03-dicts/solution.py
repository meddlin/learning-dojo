def word_count(text: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for word in text.lower().split():
        word = word.strip(".,!?;:")
        if word:
            counts[word] = counts.get(word, 0) + 1
    return counts


def group_by_first_letter(words: list[str]) -> dict[str, list[str]]:
    groups: dict[str, list[str]] = {}
    for word in words:
        groups.setdefault(word[0].lower(), []).append(word)
    return groups


def merge_inventory(a: dict[str, int], b: dict[str, int]) -> dict[str, int]:
    merged = dict(a)
    for item, n in b.items():
        merged[item] = merged.get(item, 0) + n
    return merged


def top_n(counts: dict[str, int], n: int) -> list[tuple[str, int]]:
    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:n]


def get_path(data: dict, path: str, default=None):
    current = data
    for key in path.split("."):
        if not isinstance(current, dict) or key not in current:
            return default
        current = current[key]
    return current


if __name__ == "__main__":
    print(word_count("the cat and the hat"))
    print(get_path({"a": {"b": 1}}, "a.b"))
