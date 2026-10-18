package main

import "fmt"

type Point struct{ X, Y int }

type Rect struct{ Left, Top, Width, Height int }

type Item struct {
	Name string
	Qty  int
}

func Translate(pts []Point, dx, dy int) {
	for i := range pts {
		pts[i].X += dx
		pts[i].Y += dy
	}
}

func Contains(r Rect, p Point) bool {
	return p.X >= r.Left && p.X < r.Left+r.Width && p.Y >= r.Top && p.Y < r.Top+r.Height
}

func Biggest(rects []Rect) *Rect {
	best := -1
	for i := range rects {
		if best == -1 || rects[i].Width*rects[i].Height > rects[best].Width*rects[best].Height {
			best = i
		}
	}
	if best == -1 {
		return nil
	}
	return &rects[best]
}

func Restock(inv map[string]Item, name string, n int) {
	it := inv[name]
	it.Name = name
	it.Qty += n
	inv[name] = it
}

type Animal struct{ Name string }

func (a Animal) Speak() string { return "..." }

func (a Animal) Introduce() string { return a.Name + " says " + a.Speak() }

type Dog struct {
	Animal
	Breed string
}

func NewDog(name, breed string) Dog {
	return Dog{Animal: Animal{Name: name}, Breed: breed}
}

func (d Dog) Speak() string { return "Woof" }

func (d Dog) Introduce() string { return d.Name + " says " + d.Speak() }

func main() {
	d := NewDog("Rex", "labrador")
	fmt.Println(d.Name, d.Speak(), d.Introduce())
}
