package main

import "fmt"

func Greeting(name string) string {
	if name == "" {
		name = "world"
	}
	return "Hello, " + name + "!"
}

func Average(a, b int) float64 {
	return float64(a+b) / 2
}

func Describe(n int) string {
	return fmt.Sprintf("%d = 0x%x = 0b%b", n, n, n)
}

func ZeroValues() string {
	var i int
	var s string
	var b bool
	var sl []int
	var m map[string]int
	var p *int
	return fmt.Sprintf("%v %q %v %v %v %v", i, s, b, sl, m, p)
}

func main() {
	fmt.Println(Greeting("Gopher"))
}
