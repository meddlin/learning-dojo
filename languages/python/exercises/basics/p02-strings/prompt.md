# Strings

## Concept

A `str` is an **immutable** sequence of Unicode characters. Every "change" makes a new string; `s.upper()` returns a new value and leaves `s` alone.

```python
s = "Python"
s[0], s[-1]        # 'P', 'n'        negative indices count from the end
s[1:4]             # 'yth'           slice [start:stop), stop excluded
s[:2], s[2:]       # 'Py', 'thon'
s[::-1]            # 'nohtyP'        a step of -1 reverses
len(s)             # 6
"th" in s          # True
s * 2              # 'PythonPython'
```

The methods you will reach for every day:

```python
"  hi  ".strip()              # 'hi'   (also lstrip / rstrip)
"a,b,,c".split(",")           # ['a', 'b', '', 'c']
"  a  b\tc ".split()          # ['a', 'b', 'c']  no argument: any whitespace, no empties
"-".join(["a", "b", "c"])     # 'a-b-c'  join is a method of the separator
"Hello".lower(), "hi".title() # 'hello', 'Hi'
"report.csv".endswith(".csv") # True
"banana".count("a")           # 3
"banana".replace("a", "o")    # 'bonono'
"key=value".partition("=")    # ('key', '=', 'value')
"a1!".isalnum(), "7".isdigit()
```

Build strings with `"".join(pieces)` or an f-string rather than `+=` in a long loop.

## Your task

Implement in `solution.py`:

1. `reverse_words(text)`: the words in reverse order, separated by single spaces. `"  hello   big world "` becomes `"world big hello"`.
2. `is_palindrome(text)`: `True` if the text reads the same backwards, ignoring case and anything that is not a letter or digit. `"A man, a plan, a canal: Panama"` is a palindrome.
3. `initials(name)`: `"ada lovelace"` becomes `"A.L."`; extra spaces are ignored.
4. `mask_email(email)`: keep the first character of the part before `@`, replace the rest with `***`: `"grace@navy.mil"` becomes `"g***@navy.mil"`.
5. `slug(title)`: a URL-friendly version: lower case, runs of anything that is not a letter or digit become a single `-`, with no `-` at either end. `"Hello, World! 2024"` becomes `"hello-world-2024"`.
