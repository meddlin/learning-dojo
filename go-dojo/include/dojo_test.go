package main

// dojo_test.go: a few tiny assertion helpers shared by every exercise's tests.
// You never need to edit it. The runner copies it next to your solution.go and the
// exercise's solution_test.go before running `go test`.
//
//	Equal(t, got, want)             fails the test now if the two values differ
//	True(t, cond) / False(t, cond)  fails the test now if cond is not true / false
//	Near(t, got, want, eps)         float comparison within a tolerance
//
// Each takes optional trailing context that is printed after a failure, either as
// plain values or as a format string and arguments:
//
//	Equal(t, got, want, "seed %d", seed)
//
// Equal compares deeply, like reflect.DeepEqual, with one friendlier rule: a nil
// slice or map equals an empty one, because for these exercises "no results" is the
// same answer however you spell it. Values must have the same type.

import (
	"fmt"
	"math"
	"reflect"
	"testing"
)

func contextText(ctx []any) string {
	if len(ctx) == 0 {
		return ""
	}
	text := ""
	if format, ok := ctx[0].(string); ok && len(ctx) > 1 {
		text = fmt.Sprintf(format, ctx[1:]...)
	} else {
		text = fmt.Sprint(ctx...)
	}
	return "\ncase: " + text
}

func show(v any) string {
	var s string
	switch x := v.(type) {
	case nil:
		s = "nil"
	case string:
		s = fmt.Sprintf("%q", x)
	default:
		rv := reflect.ValueOf(v)
		switch {
		case (rv.Kind() == reflect.Slice || rv.Kind() == reflect.Array) && rv.Type().Elem().Kind() == reflect.String:
			s = fmt.Sprintf("%q", v)
		case rv.Kind() == reflect.Struct || rv.Kind() == reflect.Pointer:
			s = fmt.Sprintf("%+v", v)
		default:
			s = fmt.Sprintf("%v", v)
		}
	}
	const limit = 300
	if len(s) > limit {
		s = s[:limit] + fmt.Sprintf("... (%d chars)", len(s))
	}
	return s
}

func sameValue(a, b reflect.Value) bool {
	if !a.IsValid() || !b.IsValid() {
		return a.IsValid() == b.IsValid()
	}
	if a.Type() != b.Type() {
		return false
	}
	switch a.Kind() {
	case reflect.Slice, reflect.Array:
		if a.Len() != b.Len() {
			return false
		}
		for i := 0; i < a.Len(); i++ {
			if !sameValue(a.Index(i), b.Index(i)) {
				return false
			}
		}
		return true
	case reflect.Map:
		if a.Len() != b.Len() {
			return false
		}
		iter := a.MapRange()
		for iter.Next() {
			other := b.MapIndex(iter.Key())
			if !other.IsValid() || !sameValue(iter.Value(), other) {
				return false
			}
		}
		return true
	case reflect.Struct:
		for i := 0; i < a.NumField(); i++ {
			if !sameValue(a.Field(i), b.Field(i)) {
				return false
			}
		}
		return true
	case reflect.Pointer, reflect.Interface:
		if a.IsNil() || b.IsNil() {
			return a.IsNil() == b.IsNil()
		}
		if a.Kind() == reflect.Pointer && a.Pointer() == b.Pointer() {
			return true
		}
		return sameValue(a.Elem(), b.Elem())
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return a.Int() == b.Int()
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64, reflect.Uintptr:
		return a.Uint() == b.Uint()
	case reflect.Float32, reflect.Float64:
		return a.Float() == b.Float()
	case reflect.String:
		return a.String() == b.String()
	case reflect.Bool:
		return a.Bool() == b.Bool()
	case reflect.Func, reflect.Chan, reflect.UnsafePointer:
		return a.IsNil() && b.IsNil()
	default:
		return reflect.DeepEqual(a.Interface(), b.Interface())
	}
}

// Equal fails the test immediately unless got and want are deeply equal.
func Equal(t *testing.T, got, want any, ctx ...any) {
	t.Helper()
	if sameValue(reflect.ValueOf(got), reflect.ValueOf(want)) {
		return
	}
	note := ""
	if got != nil && want != nil && reflect.TypeOf(got) != reflect.TypeOf(want) {
		note = fmt.Sprintf("\n(types differ: %T vs %T)", got, want)
	}
	t.Fatalf("expected: %s\n  actual: %s%s%s", show(want), show(got), note, contextText(ctx))
}

// True fails the test immediately unless cond is true.
func True(t *testing.T, cond bool, ctx ...any) {
	t.Helper()
	if !cond {
		t.Fatalf("expected this to be true%s", contextText(ctx))
	}
}

// False fails the test immediately unless cond is false.
func False(t *testing.T, cond bool, ctx ...any) {
	t.Helper()
	if cond {
		t.Fatalf("expected this to be false%s", contextText(ctx))
	}
}

// Near fails the test immediately unless |got-want| <= eps.
func Near(t *testing.T, got, want, eps float64, ctx ...any) {
	t.Helper()
	if !(math.Abs(got-want) <= eps) {
		t.Fatalf("expected: %v (+/- %v)\n  actual: %v%s", want, eps, got, contextText(ctx))
	}
}
