# Strings, bytes and runes

## Concept

A Go `string` is an **immutable sequence of bytes**, by convention UTF-8 text. Nothing in the language forces the bytes to be valid UTF-8, but the standard library assumes they are.

```go
s := "héllo, 世界"
len(s)             // 14: bytes, not characters (é takes 2, each of 世 界 takes 3)
s[1]               // 195: a byte (the first half of é)
s[0:1]             // "h"
s[1:2]             // "\xc3": half a character: valid slicing, broken text
len([]rune(s))     // 9 characters (code points)
```

- A **byte** (`uint8`) is one element of the string's storage. `s[i]` is a byte.
- A **rune** (`int32`, written `'x'`) is one Unicode code point. `for i, r := range s` decodes UTF-8 for you: `i` is the byte offset where the rune starts, `r` the rune. Invalid bytes show up as `utf8.RuneError` (`'�'`) with width 1.
- `[]rune(s)` decodes the whole string into a slice you can index and modify; `string(runes)` encodes back. `[]byte(s)` and `string(bytes)` copy the raw bytes.
- Strings are **immutable**: `s[0] = 'x'` does not compile. To "edit" text, convert to `[]rune` or `[]byte`, change that, and convert back, or build a new string with `strings.Builder`.
- Concatenating in a loop (`s += x`) copies every time and is O(n²); `strings.Builder` is O(n).

Useful packages: `unicode` (`IsLetter`, `IsDigit`, `IsSpace`, `ToUpper`, `ToLower`), `unicode/utf8` (`RuneCountInString`, `RuneLen`, `DecodeRuneInString`) and `strings`.

The practical rule: **iterate with `range` (runes) when you care about characters, index (bytes) only when you really mean bytes.** Cutting a string at an arbitrary byte offset can slice through a character. (Even runes are not always "what a person sees as one character": some letters are built from several code points. This exercise ignores that.)

## Your task

Implement in `solution.go`:

1. `RuneCount(s string) int`: the number of characters (code points) in `s`, e.g. `RuneCount("héllo")` is 5.
2. `ReverseString(s string) string`: the characters in reverse order, e.g. `"héllo"` becomes `"olléh"`.
3. `IsPalindrome(s string) bool`: true if the letters and digits of `s`, ignoring case, spaces and punctuation, read the same backwards. The empty string is a palindrome.
4. `CaesarShift(s string, k int) string`: shift every ASCII letter `k` places forward in the alphabet (wrapping around, keeping its case); `k` may be negative or larger than 26. All other characters stay as they are.
5. `TruncateRunes(s string, n int) string`: the first `n` characters of `s`; all of `s` if it is shorter, `""` if `n <= 0`. It must never cut a multi-byte character in half.
