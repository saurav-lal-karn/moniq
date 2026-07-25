package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
)

type transactionItemRepository struct {
	db database.DB
}

type TransactionItemRepository interface {
	Create(ctx context.Context, transactionItem *model.TransactionItem) error
	List(ctx context.Context, transactionID uuid.UUID) ([]*model.TransactionItem, error)
	Update(ctx context.Context, transactionItem *model.TransactionItem) error
	Delete(ctx context.Context, id uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionItem, error)
}

func NewTransactionItemRepository(db database.DB) TransactionItemRepository {
	return &transactionItemRepository{
		db: db,
	}
}

func (r *transactionItemRepository) Create(ctx context.Context, transactionItem *model.TransactionItem) error {
	query := `
		INSERT INTO transaction_items(
			id,
			name,
			quantity,
			price,
			transaction_id,
			created_by
		)
		VALUES($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, transactionItem.ID, transactionItem.Name, transactionItem.Quantity, transactionItem.Price, transactionItem.TransactionID, transactionItem.CreatedBy)
	return err
}

func (r *transactionItemRepository) List(ctx context.Context, transactionID uuid.UUID) ([]*model.TransactionItem, error) {
	query := `
		SELECT
			id,
			name,
			quantity,
			price,
			total,
			transaction_id,
			created_by
		FROM transaction_items
		WHERE transaction_id = $1 AND deleted_at IS NULL
	`

	rows, err := r.db.Executor(ctx).Query(ctx, query, transactionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactionItems []*model.TransactionItem
	for rows.Next() {
		var transactionItem model.TransactionItem
		if err := rows.Scan(&transactionItem.ID, &transactionItem.Name, &transactionItem.Quantity, &transactionItem.Price, &transactionItem.Total, &transactionItem.TransactionID, &transactionItem.CreatedBy); err != nil {
			return nil, err
		}
		transactionItems = append(transactionItems, &transactionItem)
	}

	return transactionItems, nil
}

func(r *transactionItemRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionItem, error) {
	query := `
		SELECT
			id,
			name,
			quantity,
			price,
			total,
			transaction_id,
			created_by
		FROM transaction_items
		WHERE id = $1 AND deleted_at IS NULL
	`

	var transactionItem model.TransactionItem
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&transactionItem.ID, &transactionItem.Name, &transactionItem.Quantity, &transactionItem.Price, &transactionItem.Total, &transactionItem.TransactionID, &transactionItem.CreatedBy)
	if err != nil {
		return nil, err
	}

	return &transactionItem, nil
}

func (r *transactionItemRepository) Update(ctx context.Context, transactionItem *model.TransactionItem) error {
	query := `
		UPDATE transaction_items SET
			name = COALESCE($1, name),
			quantity = COALESCE($2, quantity),
			price = COALESCE($3, price),
			transaction_id = COALESCE($4, transaction_id),
			created_by = COALESCE($5, created_by)
		WHERE id = $6 AND deleted_at IS NULL
		RETURNING id
	`

	var updatedTransactionItem model.TransactionItem
	err := r.db.Executor(ctx).QueryRow(ctx, query, transactionItem.Name, transactionItem.Quantity, transactionItem.Price, transactionItem.TransactionID, transactionItem.CreatedBy, transactionItem.ID).Scan(&updatedTransactionItem.ID)
	if err != nil {
		return err
	}

	return nil
}

func (r *transactionItemRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE transaction_items SET deleted_at = NOW() WHERE id = $1
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, id)
	if err != nil {
		return err
	}
	return nil
}