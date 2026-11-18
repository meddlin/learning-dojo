def fizzbuzz(n: int) -> list[str]:
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("FizzBuzz")
        elif i % 3 == 0:
            out.append("Fizz")
        elif i % 5 == 0:
            out.append("Buzz")
        else:
            out.append(str(i))
    return out


def collatz_steps(n: int) -> int:
    steps = 0
    while n != 1:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        steps += 1
    return steps


def first_index_over(values: list[float], limit: float) -> int:
    for i, value in enumerate(values):
        if value > limit:
            return i
    return -1


def grade(score: float) -> str:
    if not 0 <= score <= 100:
        return "invalid"
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    return "F"


def respond(command: str) -> str:
    match command.split():
        case ["go", direction]:
            return f"You go {direction}."
        case ["look"]:
            return "You look around."
        case ["take", *things] if things:
            return f"You take the {' '.join(things)}."
        case ["quit" | "exit"]:
            return "Goodbye."
        case _:
            return f"I don't understand: {command.strip()}"


if __name__ == "__main__":
    for i, word in enumerate(["zero", "one", "two"]):
        print(i, word)
    print(respond("go north"))
