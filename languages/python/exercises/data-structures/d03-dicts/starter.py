def word_count(text: str) -> dict[str, int]:
    raise NotImplementedError


def group_by_first_letter(words: list[str]) -> dict[str, list[str]]:
    raise NotImplementedError


def merge_inventory(a: dict[str, int], b: dict[str, int]) -> dict[str, int]:
    raise NotImplementedError


def top_n(counts: dict[str, int], n: int) -> list[tuple[str, int]]:
    raise NotImplementedError


def get_path(data: dict, path: str, default=None):
    raise NotImplementedError


if __name__ == "__main__":
    ages = {"ada": 36, "grace": 45}
    for name, age in ages.items():
        print(name, age)
    print(ages.get("bob", "no bob"))
