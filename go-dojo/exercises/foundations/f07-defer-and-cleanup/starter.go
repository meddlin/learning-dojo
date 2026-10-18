package main

import (
	"fmt"
	"io"
	"sync"
)

// Source produces chunks of text. Read returns io.EOF when there is no more.
type Source interface {
	Read() (string, error)
	Close() error
}

// Sink consumes chunks of text.
type Sink interface {
	Write(chunk string) error
	Close() error
}

// Tx is a transaction.
type Tx interface {
	Commit() error
	Rollback() error
}

// Copy moves every chunk from src to dst until src returns io.EOF.
// dst and src are both closed exactly once on every path. The returned error is
// the first of: a read/write error, dst's Close error, src's Close error.
func Copy(dst Sink, src Source) error {
	return nil // TODO
}

// Locked runs f while holding mu. The lock is released even if f panics.
func Locked(mu sync.Locker, f func()) {
	// TODO
}

// RunInTx runs work: Commit if it returns nil; Rollback if it returns an error
// (returning that error, joined with the rollback's error if that fails too);
// Rollback and keep panicking if work panics.
func RunInTx(tx Tx, work func() error) error {
	return nil // TODO
}

func main() {
	fmt.Println(io.EOF)
}
