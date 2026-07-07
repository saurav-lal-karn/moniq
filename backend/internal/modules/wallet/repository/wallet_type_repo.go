package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
)

type walletTypeRepository struct {
	db database.DB
}


type WalletTypeRepository interface {
	Create(ctx context.Context, walletType *model.WalletType) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.WalletType, error)
	List(ctx context.Context) ([]*model.WalletType, error)
	Update(ctx context.Context, walletType *model.WalletType) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewWalletTypeRepository(db database.DB) WalletTypeRepository {
	return &walletTypeRepository{
		db: db,
	}
}


// Create implements WalletTypeRepository.
func (w *walletTypeRepository) Create(ctx context.Context, walletType *model.WalletType) error {
	query := `
		INSERT INTO wallet_types(id, name, description,workspace_id, created_by)
		VALUES($1, $2, $3, $4, $5)
	`
	
	_, err := w.db.Executor(ctx).Exec(ctx, query, walletType.ID, walletType.Name, walletType.Description, walletType.WorkspaceID, walletType.CreatedBy)
	return err
}

// Delete implements WalletTypeRepository.
func (w *walletTypeRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE wallet_types SET deleted_at = NOW() WHERE id = $1
	`
	_, err := w.db.Executor(ctx).Exec(ctx, query, id)
	return err
}

// GetByID implements WalletTypeRepository.
func (w *walletTypeRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.WalletType, error) {
	var walletType model.WalletType
	query := `
		SELECT id, name, description,workspace_id, created_by
		FROM wallet_types WHERE id = $1 AND deleted_at IS NULL
	`
	err := w.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&walletType.ID, &walletType.Name, &walletType.Description, &walletType.WorkspaceID, &walletType.CreatedBy)
	if err != nil {
		return nil, err
	}
	return &walletType, nil
}

// List implements WalletTypeRepository.
func (w *walletTypeRepository) List(ctx context.Context) ([]*model.WalletType, error) {
	query := `
		SELECT id, name, description,workspace_id, created_by
		FROM wallet_types WHERE deleted_at IS NULL
	`
	rows, err := w.db.Executor(ctx).Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var walletTypes []*model.WalletType
	for rows.Next() {
		var walletType model.WalletType
		if err := rows.Scan(&walletType.ID, &walletType.Name, &walletType.Description, &walletType.WorkspaceID, &walletType.CreatedBy); err != nil {
			return nil, err
		}
		walletTypes = append(walletTypes, &walletType)
	}
	return walletTypes, nil
}

// Update implements WalletTypeRepository.
func (w *walletTypeRepository) Update(ctx context.Context, walletType *model.WalletType) error {
	query := `
		UPDATE wallet_types SET name = $1, description = $2 WHERE id = $3
	`
	_, err := w.db.Executor(ctx).Exec(ctx, query, walletType.Name, walletType.Description, walletType.ID)
	return err
}