package main

import (
	"fmt"
	"strings"
	"unicode"
)

func RuneCount(s string) int {
	n := 0
	for range s {
		n++
	}
	return n
}

func ReverseString(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

func IsPalindrome(s string) bool {
	var kept []rune
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			kept = append(kept, unicode.ToLower(r))
		}
	}
	for i, j := 0, len(kept)-1; i < j; i, j = i+1, j-1 {
		if kept[i] != kept[j] {
			return false
		}
	}
	return true
}

func CaesarShift(s string, k int) string {
	shift := rune(((k % 26) + 26) % 26)
	var sb strings.Builder
	for _, r := range s {
		switch {
		case r >= 'a' && r <= 'z':
			r = 'a' + (r-'a'+shift)%26
		case r >= 'A' && r <= 'Z':
			r = 'A' + (r-'A'+shift)%26
		}
		sb.WriteRune(r)
	}
	return sb.String()
}

func TruncateRunes(s string, n int) string {
	if n <= 0 {
		return ""
	}
	count := 0
	for i := range s {
		if count == n {
			return s[:i]
		}
		count++
	}
	return s
}

func main() {
	s := "héllo, 世界"
	fmt.Println(len(s), len([]rune(s)))
	for i, r := range s {
		fmt.Printf("%d:%c ", i, r)
	}
	fmt.Println()
}
