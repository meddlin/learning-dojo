package main

import (
	"fmt"
	"slices"
	"strings"
	"unicode"
)

func WordCount(text string) map[string]int {
	counts := make(map[string]int)
	for _, w := range strings.Fields(strings.ToLower(text)) {
		counts[w]++
	}
	return counts
}

func SortedKeys(m map[string]int) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	slices.Sort(keys)
	return keys
}

func Lookup(m map[string]int, key string) string {
	if n, ok := m[key]; ok {
		return fmt.Sprintf("%s=%d", key, n)
	}
	return key + " missing"
}

func Initials(name string) string {
	var sb strings.Builder
	for _, w := range strings.Fields(name) {
		r := []rune(w)
		sb.WriteRune(unicode.ToUpper(r[0]))
	}
	return sb.String()
}

func main() {
	counts := WordCount("the quick brown fox jumps over the lazy dog")
	fmt.Println(counts)
}
