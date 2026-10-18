# Maps and strings

## Concept

A **map** is a hash table: `map[KeyType]ValueType`. Keys must be comparable (`==`), such as ints, strings and structs of those.

```go
ages := map[string]int{"ada": 36, "grace": 45}   // literal
counts := make(map[string]int)                    // empty, ready to use
counts["go"]++                                    // missing key reads as 0, so this works
n, ok := ages["linus"]                            // "comma-ok": ok is false if the key is absent
delete(ages, "ada")
len(ages)
for name, age := range ages { ... }               // order is RANDOM on purpose
```

Two traps: a **nil map** (`var m map[string]int`) can be read but writing to it panics, so create maps with `make` or a literal; and **iteration order is randomised**, so never depend on it. If you need a stable order, collect and sort the keys.

A **string** is an immutable sequence of **bytes**, conventionally UTF-8. `len(s)` counts bytes, `s[i]` is a byte, and `s[a:b]` slices bytes. A **rune** is one Unicode code point (an `int32`). `for i, r := range s` decodes runes for you; `[]rune(s)` converts to a slice of them.

```go
s := "héllo"
len(s)              // 6: the é takes two bytes
len([]rune(s))      // 5
for i, r := range s // i is the byte offset, r the rune
```

The `strings` package has what you expect (`Fields`, `Split`, `Join`, `ToUpper`, `Contains`, `TrimSpace`, `Repeat`...). To build a string piece by piece use `strings.Builder` rather than `+=` in a loop.

## Your task

Implement in `solution.go`:

1. `WordCount(text string) map[string]int`: how often each word occurs, ignoring case; words are separated by any whitespace.
2. `SortedKeys(m map[string]int) []string`: the keys of `m` in ascending order.
3. `Lookup(m map[string]int, key string) string`: `"<key>=<value>"` if the key is present (even if its value is 0), otherwise `"<key> missing"`.
4. `Initials(name string) string`: the upper-cased first letter of each word. `Initials("ada lovelace")` is `"AL"`. It must handle extra spaces and non-ASCII letters (`Initials("élan vital")` is `"ÉV"`).
