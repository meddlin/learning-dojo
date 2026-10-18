package main

import "testing"

func TestWordCount(t *testing.T) {
	got := WordCount("the quick brown fox jumps over the lazy dog the end")
	Equal(t, got, map[string]int{"the": 3, "quick": 1, "brown": 1, "fox": 1, "jumps": 1, "over": 1, "lazy": 1, "dog": 1, "end": 1})
}

func TestWordCountIgnoresCaseAndExtraSpace(t *testing.T) {
	got := WordCount("  Go go\tGO\ngopher  ")
	Equal(t, got, map[string]int{"go": 3, "gopher": 1})
}

func TestWordCountOfNothing(t *testing.T) {
	Equal(t, len(WordCount("")), 0)
	Equal(t, len(WordCount("   ")), 0)
}

func TestSortedKeys(t *testing.T) {
	m := map[string]int{"pear": 1, "apple": 5, "fig": 2, "banana": 3}
	Equal(t, SortedKeys(m), []string{"apple", "banana", "fig", "pear"})
}

func TestSortedKeysIsStableAcrossCalls(t *testing.T) {
	m := map[string]int{}
	for _, k := range []string{"d", "b", "a", "c", "e", "h", "g", "f"} {
		m[k] = 1
	}
	want := []string{"a", "b", "c", "d", "e", "f", "g", "h"}
	for range 20 {
		Equal(t, SortedKeys(m), want)
	}
}

func TestSortedKeysOfAnEmptyMap(t *testing.T) {
	Equal(t, len(SortedKeys(map[string]int{})), 0)
	Equal(t, len(SortedKeys(nil)), 0)
}

func TestLookupPresentAndMissing(t *testing.T) {
	m := map[string]int{"a": 7}
	Equal(t, Lookup(m, "a"), "a=7")
	Equal(t, Lookup(m, "b"), "b missing")
}

func TestLookupDistinguishesZeroFromMissing(t *testing.T) {
	m := map[string]int{"zero": 0}
	Equal(t, Lookup(m, "zero"), "zero=0")
	Equal(t, Lookup(m, "nope"), "nope missing")
}

func TestInitials(t *testing.T) {
	Equal(t, Initials("ada lovelace"), "AL")
	Equal(t, Initials("Grace Brewster Hopper"), "GBH")
	Equal(t, Initials("  grace   hopper "), "GH")
	Equal(t, Initials(""), "")
}

func TestInitialsOfNonASCIILetters(t *testing.T) {
	Equal(t, Initials("élan vital"), "ÉV")
	Equal(t, Initials("zoë ünal"), "ZÜ")
}
