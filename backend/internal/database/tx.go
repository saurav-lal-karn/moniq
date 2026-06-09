package database

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Executor is the common subset of *pgxpool.Pool and pgx.Tx. Repositories
// depend on this so the same query code runs either directly against the pool
// or inside a transaction, depending on the context.
type Executor interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

// DB is what repositories depend on to obtain the active executor for the
// current context. *TxManager implements it.
type DB interface {
	Executor(ctx context.Context) Executor
}

type txKey struct{}

// TxManager owns the connection pool and coordinates transactions. A single
// instance is shared across all modules, so a transaction started in one
// service can span repositories from any other module via the context.
type TxManager struct {
	pool *pgxpool.Pool
}

func NewTxManager(pool *pgxpool.Pool) *TxManager {
	return &TxManager{pool: pool}
}

// Executor returns the transaction bound to ctx if one is active, otherwise
// the pool. Repositories call this for every query and never touch the pool or
// a tx directly.
func (m *TxManager) Executor(ctx context.Context) Executor {
	if tx, ok := ctx.Value(txKey{}).(pgx.Tx); ok {
		return tx
	}
	return m.pool
}

// Run executes fn inside a database transaction. The transaction is placed on
// the context, so any repository invoked within fn — regardless of module —
// participates in the same transaction automatically.
//
// If ctx already carries a transaction (a nested Run, e.g. one service calling
// another), fn joins the existing transaction instead of starting a new one;
// commit/rollback is handled by the outermost Run.
func (m *TxManager) Run(ctx context.Context, fn func(ctx context.Context) error) (err error) {
	if _, ok := ctx.Value(txKey{}).(pgx.Tx); ok {
		return fn(ctx)
	}

	tx, err := m.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		// Rollback is a no-op (returns ErrTxClosed) after a successful Commit,
		// so this safely covers errors, early returns, and panics.
		_ = tx.Rollback(ctx)
	}()

	if err = fn(context.WithValue(ctx, txKey{}, tx)); err != nil {
		return err
	}

	return tx.Commit(ctx)
}
