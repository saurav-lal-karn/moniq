package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
)

type ledgerRepository struct {
	db database.DB
}

type LedgerRepository interface {
	// Define methods for ledger-related database operations here
	Create(ctx context.Context, ledgerEntry *model.LedgerEntry) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.LedgerEntry, error)
	List(ctx context.Context, workspaceID uuid.UUID) ([]*model.LedgerEntry, error)
	Update(ctx context.Context, ledgerEntry *model.LedgerEntry) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewLedgerRepository(db database.DB) LedgerRepository {
	return &ledgerRepository{
		db: db,
	}
}

func (r *ledgerRepository) Create(ctx context.Context, ledgerEntry *model.LedgerEntry) error {
	query := `
		INSERT INTO ledger_entries(
			id,
			amount,
			date,
			description,
			direction,
			transaction_id,
			wallet_id,
			workspace_id,
			created_by,
			transfer_group_id
		)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, ledgerEntry.ID, ledgerEntry.Amount, ledgerEntry.Date, ledgerEntry.Description, ledgerEntry.Direction, ledgerEntry.TransactionID, ledgerEntry.WalletID, ledgerEntry.WorkspaceID, ledgerEntry.CreatedBy, ledgerEntry.TransferGroupID)

	if err != nil {
		return err
	}
	
	return nil
}

func (r *ledgerRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.LedgerEntry, error) {
	query := `
		SELECT 
			id,
			amount,
			date,
			description,
			direction,
			transaction_id,
			wallet_id,
			workspace_id,
			created_by,
			transfer_group_id
		FROM ledger_entries
		WHERE id = $1
		AND deleted_at IS NULL
	`

	var ledgerEntry model.LedgerEntry
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&ledgerEntry.ID, &ledgerEntry.Amount, &ledgerEntry.Date, &ledgerEntry.Description, &ledgerEntry.Direction, &ledgerEntry.TransactionID, &ledgerEntry.WalletID, &ledgerEntry.WorkspaceID, &ledgerEntry.CreatedBy, &ledgerEntry.TransferGroupID)

	if err != nil {
		return nil, err
	}

	return &ledgerEntry, nil
}

func (r *ledgerRepository) List(ctx context.Context, workspaceID uuid.UUID) ([]*model.LedgerEntry, error) {
	rows, err := r.db.Executor(ctx).Query(ctx, "SELECT * FROM ledger_entries WHERE workspace_id = $1 AND deleted_at IS NULL", workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ledgerEntries []*model.LedgerEntry
	for rows.Next() {
		var ledgerEntry model.LedgerEntry
		err := rows.Scan(&ledgerEntry.ID, &ledgerEntry.Amount, &ledgerEntry.Date, &ledgerEntry.Description, &ledgerEntry.Direction, &ledgerEntry.TransactionID, &ledgerEntry.WalletID, &ledgerEntry.WorkspaceID, &ledgerEntry.CreatedBy, &ledgerEntry.TransferGroupID)
		if err != nil {
			return nil, err
		}
		ledgerEntries = append(ledgerEntries, &ledgerEntry)
	}

	return ledgerEntries, nil
}

func (r *ledgerRepository) Update(ctx context.Context, ledgerEntry *model.LedgerEntry) error {
	query := `
		UPDATE ledger_entries SET 
			amount = $1,
			date = $2,
			description = $3,
			direction = $4,
			transaction_id = $5,
			wallet_id = $6,
			workspace_id = $7,
			created_by = $8,
			transfer_group_id = $9
		WHERE id = $10
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, ledgerEntry.Amount, ledgerEntry.Date, ledgerEntry.Description, ledgerEntry.Direction, ledgerEntry.TransactionID, ledgerEntry.WalletID, ledgerEntry.WorkspaceID, ledgerEntry.CreatedBy, ledgerEntry.TransferGroupID, ledgerEntry.ID)
	
	if err != nil {
		return err
	}

	return nil
}

func (r *ledgerRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE ledger_entries
		SET deleted_at = NOW()
		WHERE id = $1
	`

	_, err := r.db.Executor(ctx).Exec(ctx, query, id)

	if err != nil {
		return err
	}

	return nil
}