package main

import "fmt"

// RuneCount returns the number of characters (code points) in s.
func RuneCount(s string) int {
	return 0 // TODO
}

// ReverseString returns the characters of s in reverse order.
func ReverseString(s string) string {
	return s // TODO
}

// IsPalindrome reports whether the letters and digits of s, ignoring case, spaces
// and punctuation, read the same backwards. The empty string is a palindrome.
func IsPalindrome(s string) bool {
	return false // TODO
}

// CaesarShift shifts every ASCII letter k places forward (wrapping, keeping case).
// k may be negative or larger than 26. Other characters are unchanged.
func CaesarShift(s string, k int) string {
	return s // TODO
}

// TruncateRunes returns the first n characters of s (all of s if it is shorter,
// "" if n <= 0), never cutting a multi-byte character in half.
func TruncateRunes(s string, n int) string {
	return s // TODO
}

func main() {
	s := "héllo, 世界"
	fmt.Println(len(s), len([]rune(s)))
	for i, r := range s {
		fmt.Printf("%d:%c ", i, r)
	}
	fmt.Println()
}
