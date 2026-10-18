package main

import (
	"errors"
	"fmt"
	"io"
	"sync"
)

type Source interface {
	Read() (string, error)
	Close() error
}

type Sink interface {
	Write(chunk string) error
	Close() error
}

type Tx interface {
	Commit() error
	Rollback() error
}

func Copy(dst Sink, src Source) (err error) {
	defer func() {
		if cerr := src.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	defer func() {
		if cerr := dst.Close(); cerr != nil && err == nil {
			err = cerr
		}
	}()
	for {
		chunk, rerr := src.Read()
		if rerr == io.EOF {
			return nil
		}
		if rerr != nil {
			return rerr
		}
		if werr := dst.Write(chunk); werr != nil {
			return werr
		}
	}
}

func Locked(mu sync.Locker, f func()) {
	mu.Lock()
	defer mu.Unlock()
	f()
}

func RunInTx(tx Tx, work func() error) error {
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()
	if err := work(); err != nil {
		if rerr := tx.Rollback(); rerr != nil {
			return errors.Join(err, rerr)
		}
		return err
	}
	return tx.Commit()
}

func main() {
	fmt.Println(io.EOF)
}
