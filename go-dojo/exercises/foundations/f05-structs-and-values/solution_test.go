package main

import "testing"

func TestTranslateMovesTheCallersPoints(t *testing.T) {
	pts := []Point{{0, 0}, {1, 2}, {-3, 4}}
	Translate(pts, 10, -1)
	Equal(t, pts, []Point{{10, -1}, {11, 1}, {7, 3}})
}

func TestTranslateOfNothing(t *testing.T) {
	Translate(nil, 1, 1)
	Translate([]Point{}, 1, 1)
}

func TestContainsInsideAndOutside(t *testing.T) {
	r := Rect{Left: 2, Top: 3, Width: 4, Height: 2}
	True(t, Contains(r, Point{3, 4}))
	False(t, Contains(r, Point{0, 0}))
	False(t, Contains(r, Point{3, 10}))
	False(t, Contains(r, Point{10, 4}))
}

func TestContainsEdgesAreHalfOpen(t *testing.T) {
	r := Rect{Left: 2, Top: 3, Width: 4, Height: 2}
	True(t, Contains(r, Point{2, 3}), "top-left corner is inside")
	True(t, Contains(r, Point{5, 4}), "last cell is inside")
	False(t, Contains(r, Point{6, 3}), "right edge is outside")
	False(t, Contains(r, Point{2, 5}), "bottom edge is outside")
	False(t, Contains(r, Point{1, 3}))
	False(t, Contains(r, Point{2, 2}))
}

func TestContainsAnEmptyRectContainsNothing(t *testing.T) {
	False(t, Contains(Rect{Left: 1, Top: 1}, Point{1, 1}))
}

func TestBiggestFindsTheLargestArea(t *testing.T) {
	rects := []Rect{{0, 0, 2, 2}, {0, 0, 3, 5}, {0, 0, 4, 1}}
	p := Biggest(rects)
	True(t, p != nil, "expected a pointer")
	Equal(t, *p, Rect{0, 0, 3, 5})
}

func TestBiggestPointsIntoTheSliceNotAtACopy(t *testing.T) {
	rects := []Rect{{0, 0, 1, 1}, {0, 0, 9, 9}, {0, 0, 2, 2}}
	p := Biggest(rects)
	p.Width = 100
	Equal(t, rects[1].Width, 100, "writing through the pointer should change the slice element")
	True(t, p == &rects[1], "expected the address of rects[1]")
}

func TestBiggestTiesGoToTheFirst(t *testing.T) {
	rects := []Rect{{0, 0, 2, 3}, {0, 0, 3, 2}}
	True(t, Biggest(rects) == &rects[0], "on equal areas the first rectangle wins")
}

func TestBiggestOfNothing(t *testing.T) {
	True(t, Biggest(nil) == nil, "expected nil")
}

func TestRestockAddsToExistingItems(t *testing.T) {
	inv := map[string]Item{"bolt": {"bolt", 5}}
	Restock(inv, "bolt", 3)
	Equal(t, inv["bolt"], Item{"bolt", 8})
}

func TestRestockCreatesMissingItems(t *testing.T) {
	inv := map[string]Item{}
	Restock(inv, "nut", 4)
	Equal(t, inv["nut"], Item{"nut", 4})
	Equal(t, len(inv), 1)
}

func TestDogHasItsOwnFieldsAndPromotedOnes(t *testing.T) {
	d := NewDog("Rex", "labrador")
	Equal(t, d.Name, "Rex")
	Equal(t, d.Breed, "labrador")
}

func TestDogSpeaksLikeADog(t *testing.T) {
	d := NewDog("Rex", "labrador")
	Equal(t, d.Speak(), "Woof")
	Equal(t, d.Animal.Speak(), "...")
}

func TestDogIntroducesItselfAsADog(t *testing.T) {
	d := NewDog("Rex", "labrador")
	Equal(t, d.Introduce(), "Rex says Woof")
}

func TestTheEmbeddedAnimalStillBehavesLikeAnAnimal(t *testing.T) {
	d := NewDog("Rex", "labrador")
	Equal(t, d.Animal.Introduce(), "Rex says ...", "Animal.Introduce has no idea it lives inside a Dog")
}
