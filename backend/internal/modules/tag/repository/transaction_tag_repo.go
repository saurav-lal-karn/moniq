package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/model"
)

type transactionTagRepository struct {
	db database.DB
}

func NewTransactionTagRepository(db database.DB) TransactionTagRepository {
	return &transactionTagRepository{
		db: db,
	}
}

type TransactionTagRepository interface {
	Create(ctx context.Context, tag *model.TransactionTag) error
	Delete(ctx context.Context, transactionID uuid.UUID, tagID uuid.UUID) error
}

func (r *transactionTagRepository) Create(ctx context.Context, tag *model.TransactionTag) error {
	query := `
		INSERT INTO transaction_tags(transaction_id, tag_id)
		VALUES($1, $2)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, tag.TransactionID, tag.TagID)
	return err
}

func (r *transactionTagRepository) Delete(ctx context.Context, transactionID, tagID uuid.UUID) error {
	query := `
		DELETE FROM transaction_tags WHERE transaction_id = $1 AND tag_id = $2
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, transactionID, tagID)
	return err
}
