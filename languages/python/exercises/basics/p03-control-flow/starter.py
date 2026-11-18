def fizzbuzz(n: int) -> list[str]:
    raise NotImplementedError


def collatz_steps(n: int) -> int:
    raise NotImplementedError


def first_index_over(values: list[float], limit: float) -> int:
    raise NotImplementedError


def grade(score: float) -> str:
    raise NotImplementedError


def respond(command: str) -> str:
    # Use a match statement on command.split().
    raise NotImplementedError


if __name__ == "__main__":
    for i, word in enumerate(["zero", "one", "two"]):
        print(i, word)
    print(respond("go north"))
