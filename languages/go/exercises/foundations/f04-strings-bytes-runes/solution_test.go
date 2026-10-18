package main

import "testing"

func TestRuneCount(t *testing.T) {
	Equal(t, RuneCount(""), 0)
	Equal(t, RuneCount("abc"), 3)
	Equal(t, RuneCount("héllo"), 5)
	Equal(t, RuneCount("日本語"), 3)
	Equal(t, RuneCount("a😀b"), 3)
}

func TestRuneCountCountsABrokenByteAsOneCharacter(t *testing.T) {
	Equal(t, RuneCount("a\xffb"), 3)
}

func TestReverseString(t *testing.T) {
	Equal(t, ReverseString("hello"), "olleh")
	Equal(t, ReverseString("héllo"), "olléh")
	Equal(t, ReverseString("日本語"), "語本日")
	Equal(t, ReverseString(""), "")
	Equal(t, ReverseString("x"), "x")
}

func TestReverseStringKeepsEmojiIntact(t *testing.T) {
	Equal(t, ReverseString("a😀b"), "b😀a")
}

func TestPalindromes(t *testing.T) {
	True(t, IsPalindrome("racecar"))
	True(t, IsPalindrome("A man, a plan, a canal: Panama"))
	True(t, IsPalindrome("Was it a car or a cat I saw?"))
	True(t, IsPalindrome("12321"))
	True(t, IsPalindrome(""))
	True(t, IsPalindrome("!?"))
}

func TestNonPalindromes(t *testing.T) {
	False(t, IsPalindrome("hello"))
	False(t, IsPalindrome("ab"))
	False(t, IsPalindrome("12345"))
}

func TestPalindromesWithNonASCIILetters(t *testing.T) {
	True(t, IsPalindrome("Éé"))
	True(t, IsPalindrome("été"))
	False(t, IsPalindrome("été!x"))
}

func TestCaesarShiftBasic(t *testing.T) {
	Equal(t, CaesarShift("Hello, World!", 3), "Khoor, Zruog!")
	Equal(t, CaesarShift("abcxyz", 3), "defabc")
	Equal(t, CaesarShift("ABCXYZ", 3), "DEFABC")
}

func TestCaesarShiftNegativeAndLargeShifts(t *testing.T) {
	Equal(t, CaesarShift("Khoor, Zruog!", -3), "Hello, World!")
	Equal(t, CaesarShift("Hello", 26), "Hello")
	Equal(t, CaesarShift("Hello", 29), CaesarShift("Hello", 3))
	Equal(t, CaesarShift("Hello", -29), CaesarShift("Hello", -3))
	Equal(t, CaesarShift("abc", 0), "abc")
}

func TestCaesarShiftLeavesOtherCharactersAlone(t *testing.T) {
	Equal(t, CaesarShift("héllo 世界 123", 1), "iémmp 世界 123")
}

func TestTruncateRunes(t *testing.T) {
	Equal(t, TruncateRunes("hello world", 5), "hello")
	Equal(t, TruncateRunes("héllo wörld", 5), "héllo")
	Equal(t, TruncateRunes("日本語", 2), "日本")
}

func TestTruncateRunesEdgeCases(t *testing.T) {
	Equal(t, TruncateRunes("abc", 10), "abc")
	Equal(t, TruncateRunes("abc", 3), "abc")
	Equal(t, TruncateRunes("abc", 0), "")
	Equal(t, TruncateRunes("abc", -4), "")
	Equal(t, TruncateRunes("", 3), "")
}

func TestTruncateRunesNeverSplitsACharacter(t *testing.T) {
	got := TruncateRunes("😀😀😀", 2)
	Equal(t, got, "😀😀")
	Equal(t, len(got), 8)
}
