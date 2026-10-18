package main

import (
	"errors"
	"io"
	"sync"
	"testing"
)

type chkSource struct {
	chunks   []string
	readErr  error // returned after the chunks, instead of io.EOF
	closeErr error
	closed   int
}

func (s *chkSource) Read() (string, error) {
	if len(s.chunks) == 0 {
		if s.readErr != nil {
			return "", s.readErr
		}
		return "", io.EOF
	}
	c := s.chunks[0]
	s.chunks = s.chunks[1:]
	return c, nil
}

func (s *chkSource) Close() error {
	s.closed++
	return s.closeErr
}

type chkSink struct {
	got      []string
	failAt   int // fail the Nth write (1-based); 0 = never
	writeErr error
	closeErr error
	closed   int
}

func (s *chkSink) Write(chunk string) error {
	if s.failAt > 0 && len(s.got)+1 == s.failAt {
		return s.writeErr
	}
	s.got = append(s.got, chunk)
	return nil
}

func (s *chkSink) Close() error {
	s.closed++
	return s.closeErr
}

func TestCopyMovesEverythingAndClosesBoth(t *testing.T) {
	src := &chkSource{chunks: []string{"a", "b", "c"}}
	dst := &chkSink{}
	Equal(t, Copy(dst, src), nil)
	Equal(t, dst.got, []string{"a", "b", "c"})
	Equal(t, src.closed, 1, "src must be closed exactly once")
	Equal(t, dst.closed, 1, "dst must be closed exactly once")
}

func TestCopyOfAnEmptySource(t *testing.T) {
	src := &chkSource{}
	dst := &chkSink{}
	Equal(t, Copy(dst, src), nil)
	Equal(t, len(dst.got), 0)
	Equal(t, src.closed, 1)
	Equal(t, dst.closed, 1)
}

func TestCopyReportsAReadErrorAndStillClosesBoth(t *testing.T) {
	boom := errors.New("disk on fire")
	src := &chkSource{chunks: []string{"a"}, readErr: boom}
	dst := &chkSink{}
	err := Copy(dst, src)
	True(t, errors.Is(err, boom), "expected the read error, got %v", err)
	Equal(t, dst.got, []string{"a"})
	Equal(t, src.closed, 1, "src must be closed even after a read error")
	Equal(t, dst.closed, 1, "dst must be closed even after a read error")
}

func TestCopyReportsAWriteErrorAndStillClosesBoth(t *testing.T) {
	boom := errors.New("disk full")
	src := &chkSource{chunks: []string{"a", "b", "c"}}
	dst := &chkSink{failAt: 2, writeErr: boom}
	err := Copy(dst, src)
	True(t, errors.Is(err, boom), "expected the write error, got %v", err)
	Equal(t, dst.got, []string{"a"})
	Equal(t, src.closed, 1, "src must be closed even after a write error")
	Equal(t, dst.closed, 1, "dst must be closed even after a write error")
}

func TestCopyReportsAFailedCloseOfTheSink(t *testing.T) {
	boom := errors.New("flush failed")
	src := &chkSource{chunks: []string{"a"}}
	dst := &chkSink{closeErr: boom}
	err := Copy(dst, src)
	True(t, errors.Is(err, boom), "expected the close error, got %v", err)
	Equal(t, src.closed, 1)
}

func TestCopyKeepsTheFirstErrorWhenClosingAlsoFails(t *testing.T) {
	first := errors.New("write failed")
	second := errors.New("close failed")
	src := &chkSource{chunks: []string{"a", "b"}, closeErr: second}
	dst := &chkSink{failAt: 1, writeErr: first, closeErr: second}
	err := Copy(dst, src)
	True(t, errors.Is(err, first), "the earliest error should win, got %v", err)
	False(t, errors.Is(err, second), "later errors should not replace the first, got %v", err)
}

func TestCopyReportsAFailedCloseOfTheSource(t *testing.T) {
	boom := errors.New("source close failed")
	src := &chkSource{chunks: []string{"a"}, closeErr: boom}
	dst := &chkSink{}
	err := Copy(dst, src)
	True(t, errors.Is(err, boom), "expected the source's close error, got %v", err)
	Equal(t, dst.closed, 1)
}

func TestLockedHoldsTheLockWhileRunning(t *testing.T) {
	var mu sync.Mutex
	ran := false
	Locked(&mu, func() {
		ran = true
		False(t, mu.TryLock(), "the mutex should be held while f runs")
	})
	True(t, ran, "f was never called")
	True(t, mu.TryLock(), "the mutex should be released afterwards")
}

func TestLockedReleasesTheLockWhenFPanics(t *testing.T) {
	var mu sync.Mutex
	func() {
		defer func() { recover() }()
		Locked(&mu, func() { panic("oops") })
	}()
	True(t, mu.TryLock(), "the mutex was left locked after a panic: use defer")
}

func TestLockedLetsThePanicPropagate(t *testing.T) {
	var mu sync.Mutex
	var recovered any
	func() {
		defer func() { recovered = recover() }()
		Locked(&mu, func() { panic("oops") })
	}()
	Equal(t, recovered, "oops")
}

type chkTx struct {
	commits, rollbacks     int
	commitErr, rollbackErr error
}

func (x *chkTx) Commit() error   { x.commits++; return x.commitErr }
func (x *chkTx) Rollback() error { x.rollbacks++; return x.rollbackErr }

func TestRunInTxCommitsOnSuccess(t *testing.T) {
	tx := &chkTx{}
	Equal(t, RunInTx(tx, func() error { return nil }), nil)
	Equal(t, tx.commits, 1)
	Equal(t, tx.rollbacks, 0)
}

func TestRunInTxReturnsTheCommitError(t *testing.T) {
	boom := errors.New("commit failed")
	tx := &chkTx{commitErr: boom}
	err := RunInTx(tx, func() error { return nil })
	True(t, errors.Is(err, boom), "expected the commit error, got %v", err)
}

func TestRunInTxRollsBackOnError(t *testing.T) {
	boom := errors.New("work failed")
	tx := &chkTx{}
	err := RunInTx(tx, func() error { return boom })
	True(t, errors.Is(err, boom), "expected the work error, got %v", err)
	Equal(t, tx.rollbacks, 1)
	Equal(t, tx.commits, 0, "never commit after an error")
}

func TestRunInTxReportsBothErrorsWhenRollbackFailsToo(t *testing.T) {
	workErr, rbErr := errors.New("work failed"), errors.New("rollback failed")
	tx := &chkTx{rollbackErr: rbErr}
	err := RunInTx(tx, func() error { return workErr })
	True(t, errors.Is(err, workErr), "the work error should be reported, got %v", err)
	True(t, errors.Is(err, rbErr), "the rollback error should be reported too, got %v", err)
}

func TestRunInTxRollsBackAndRepanicsWhenWorkPanics(t *testing.T) {
	tx := &chkTx{}
	var recovered any
	func() {
		defer func() { recovered = recover() }()
		RunInTx(tx, func() error { panic("kaboom") })
	}()
	Equal(t, recovered, "kaboom", "the panic must keep propagating")
	Equal(t, tx.rollbacks, 1)
	Equal(t, tx.commits, 0)
}
