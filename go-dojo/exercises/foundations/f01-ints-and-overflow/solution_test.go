package main

import (
	"math"
	"testing"
)

func TestAddOverflowsOrdinaryValues(t *testing.T) {
	False(t, AddOverflows(1, 2))
	False(t, AddOverflows(-5, 3))
	False(t, AddOverflows(0, 0))
}

func TestAddOverflowsAtTheTopEdge(t *testing.T) {
	False(t, AddOverflows(math.MaxInt32, 0))
	False(t, AddOverflows(math.MaxInt32-1, 1))
	True(t, AddOverflows(math.MaxInt32, 1))
	True(t, AddOverflows(math.MaxInt32/2+1, math.MaxInt32/2+1))
}

func TestAddOverflowsAtTheBottomEdge(t *testing.T) {
	False(t, AddOverflows(math.MinInt32, 0))
	False(t, AddOverflows(math.MinInt32+1, -1))
	True(t, AddOverflows(math.MinInt32, -1))
	True(t, AddOverflows(math.MinInt32, math.MinInt32))
}

func TestAddOverflowsOppositeSignsNeverOverflow(t *testing.T) {
	False(t, AddOverflows(math.MaxInt32, math.MinInt32))
	False(t, AddOverflows(math.MinInt32, math.MaxInt32))
}

func TestDigitSumPositive(t *testing.T) {
	Equal(t, DigitSum(0), 0)
	Equal(t, DigitSum(7), 7)
	Equal(t, DigitSum(482), 14)
	Equal(t, DigitSum(1000), 1)
}

func TestDigitSumNegative(t *testing.T) {
	Equal(t, DigitSum(-482), 14)
	Equal(t, DigitSum(-1), 1)
}

func TestDigitSumExtremes(t *testing.T) {
	Equal(t, DigitSum(math.MaxInt32), 46)
	Equal(t, DigitSum(math.MinInt32), 47)
}

func TestRotateLeftBasic(t *testing.T) {
	Equal(t, RotateLeft(0x80000001, 1), uint32(0x00000003))
	Equal(t, RotateLeft(0xF0000000, 4), uint32(0x0000000F))
	Equal(t, RotateLeft(1, 31), uint32(0x80000000))
}

func TestRotateLeftZeroAndFullTurns(t *testing.T) {
	Equal(t, RotateLeft(0x12345678, 0), uint32(0x12345678))
	Equal(t, RotateLeft(0x12345678, 32), uint32(0x12345678))
	Equal(t, RotateLeft(0x12345678, 64), uint32(0x12345678))
}

func TestRotateLeftWrapsLargeCounts(t *testing.T) {
	Equal(t, RotateLeft(0x12345678, 33), uint32(0x2468ACF0))
	Equal(t, RotateLeft(0x12345678, 36), uint32(0x23456781))
}

func TestSaturatingAddInRange(t *testing.T) {
	Equal(t, SaturatingAddInt8(1, 2), int8(3))
	Equal(t, SaturatingAddInt8(-100, 50), int8(-50))
	Equal(t, SaturatingAddInt8(127, 0), int8(127))
	Equal(t, SaturatingAddInt8(-128, 0), int8(-128))
}

func TestSaturatingAddClampsInsteadOfWrapping(t *testing.T) {
	Equal(t, SaturatingAddInt8(100, 100), int8(127))
	Equal(t, SaturatingAddInt8(127, 1), int8(127))
	Equal(t, SaturatingAddInt8(-100, -100), int8(-128))
	Equal(t, SaturatingAddInt8(-128, -1), int8(-128))
}
