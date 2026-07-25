package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
)

type transactionRepository struct {
	db database.DB
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	List(ctx context.Context, workspaceID uuid.UUID) ([]*model.Transaction, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error)
	Update(ctx context.Context, tx *model.Transaction) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewTransactionRepository(db database.DB) TransactionRepository {
	return &transactionRepository{
		db: db,
	}
}

func (r *transactionRepository) Create(ctx context.Context, tx *model.Transaction) error {
	query := `
		INSERT INTO transactions(
			id,
			amount,
			date,
			description,
			type,
			wallet_id,
			contact_id,
			workspace_id,
			created_by
		)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, tx.ID, tx.Amount, tx.Date, tx.Description, tx.Type, tx.WalletID, tx.ContactID, tx.WorkspaceID, tx.CreatedBy)

	if err != nil {
		return err
	}

	return nil
}

func (r *transactionRepository) List(ctx context.Context, workspaceID uuid.UUID) ([]*model.Transaction, error) {
	query := `
		SELECT
			id,
			amount,
			date,
			description,
			type,
			wallet_id,
			contact_id,
			workspace_id,
			created_by
		FROM transactions
		WHERE workspace_id = $1 AND deleted_at IS NULL
	`

	rows, err := r.db.Executor(ctx).Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []*model.Transaction
	for rows.Next() {
		var tx model.Transaction
		if err := rows.Scan(&tx.ID, &tx.Amount, &tx.Date, &tx.Description, &tx.Type, &tx.WalletID, &tx.ContactID, &tx.WorkspaceID, &tx.CreatedBy); err != nil {
			return nil, err
		}
		transactions = append(transactions, &tx)
	}

	return transactions, nil
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Transaction, error) {
	query := `
		SELECT
			id,
			amount,
			date,
			description,
			type,
			wallet_id,
			contact_id,
			workspace_id,
			created_by
		FROM transactions
		WHERE id = $1 AND deleted_at IS NULL
	`

	var tx model.Transaction
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&tx.ID, &tx.Amount, &tx.Date, &tx.Description, &tx.Type, &tx.WalletID, &tx.ContactID, &tx.WorkspaceID, &tx.CreatedBy)
	if err != nil {
		return nil, err
	}

	return &tx, nil
}

func (r *transactionRepository) Update(ctx context.Context, tx *model.Transaction) error {
	query := `
		UPDATE transactions SET
			amount = COALESCE($1, amount),
			date = COALESCE($2, date),
			description = COALESCE($3, description),
			type = COALESCE($4, type),
			wallet_id = COALESCE($5, wallet_id),
			contact_id = COALESCE($6, contact_id),
			workspace_id = COALESCE($7, workspace_id),
			created_by = COALESCE($8, created_by)
		WHERE id = $9 AND deleted_at IS NULL
		RETURNING id
	`

	var updatedTx model.Transaction
	err := r.db.Executor(ctx).QueryRow(ctx, query, tx.Amount, tx.Date, tx.Description, tx.Type, tx.WalletID, tx.ContactID, tx.WorkspaceID, tx.CreatedBy, tx.ID).Scan(&updatedTx.ID)
	if err != nil {
		return err
	}

	return nil
}

func (r *transactionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE transactions SET deleted_at = NOW() WHERE id = $1
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, id)
	return err
}