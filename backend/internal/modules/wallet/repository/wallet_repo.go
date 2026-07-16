package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
)

type walletRepository struct {
	db database.DB
}

type WalletRepository interface {
	Create(ctx context.Context, wallet *model.Wallet) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Wallet, error)
	List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error)
	Update(ctx context.Context, wallet *model.Wallet) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewWalletRepository(db database.DB) WalletRepository {
	return &walletRepository{
		db: db,
	}
}

func (r *walletRepository) Create(ctx context.Context, wallet *model.Wallet) error {
	query := `
		INSERT INTO wallets(id, name, description, currency, type_id, workspace_id, created_by)
		VALUES($1, $2, $3, $4, $5, $6, $7)
	`
	
	_, err := r.db.Executor(ctx).Exec(ctx, query, wallet.ID, wallet.Name, wallet.Description, wallet.Currency, wallet.TypeID, wallet.WorkspaceID, wallet.CreatedBy)
	return err
}

func (r *walletRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Wallet, error) {
	var wallet model.Wallet
	query := `
		SELECT id, name, description, currency, type_id, workspace_id, created_by
		FROM wallets WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&wallet.ID, &wallet.Name, &wallet.Description, &wallet.Currency, &wallet.TypeID, &wallet.WorkspaceID, &wallet.CreatedBy)
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

func (r *walletRepository) List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error) {
	query := `
		SELECT id, name, description, currency, type_id, workspace_id, created_by
		FROM wallets 
		WHERE deleted_at IS NULL 
				AND workspace_id = $1 
				AND created_by = $2
	`
	
	rows, err := r.db.Executor(ctx).Query(ctx, query, workspaceID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var wallets []*model.Wallet
	for rows.Next() {
		var wallet model.Wallet
		if err := rows.Scan(&wallet.ID, &wallet.Name, &wallet.Description, &wallet.Currency, &wallet.TypeID, &wallet.WorkspaceID, &wallet.CreatedBy); err != nil {
			return nil, err
		}
		wallets = append(wallets, &wallet)
	}
	return wallets, nil
}

func (r *walletRepository) Update(ctx context.Context, wallet *model.Wallet) error {
	query := `
		UPDATE wallets SET name = $1, description = $2, currency = $3, type_id = $4, workspace_id = $5 WHERE id = $6
	`
	
	_, err := r.db.Executor(ctx).Exec(ctx, query, wallet.Name, wallet.Description, wallet.Currency, wallet.TypeID, wallet.WorkspaceID, wallet.ID)
	return err
}

func (r *walletRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE wallets SET deleted_at = NOW() WHERE id = $1
	`
	
	_, err := r.db.Executor(ctx).Exec(ctx, query, id)
	return err
}