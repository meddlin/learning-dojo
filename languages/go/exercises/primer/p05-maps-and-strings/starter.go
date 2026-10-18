package main

import "fmt"

// WordCount counts how often each word occurs, ignoring case. Words are
// separated by any whitespace.
func WordCount(text string) map[string]int {
	return nil // TODO
}

// SortedKeys returns the keys of m in ascending order.
func SortedKeys(m map[string]int) []string {
	return nil // TODO
}

// Lookup returns "<key>=<value>" if key is present (even with value 0),
// otherwise "<key> missing".
func Lookup(m map[string]int, key string) string {
	return "" // TODO
}

// Initials returns the upper-cased first letter of each word:
// Initials("ada lovelace") == "AL". Handle extra spaces and non-ASCII letters.
func Initials(name string) string {
	return "" // TODO
}

func main() {
	counts := WordCount("the quick brown fox jumps over the lazy dog")
	fmt.Println(counts)
}
