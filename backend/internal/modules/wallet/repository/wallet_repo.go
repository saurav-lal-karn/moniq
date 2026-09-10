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
	GetByID(ctx context.Context, id uuid.UUID) (*model.WalletDetails, error)
	List(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) ([]*model.Wallet, error)
	Update(ctx context.Context, wallet *model.Wallet) error
	Delete(ctx context.Context, id uuid.UUID) error
	CheckOwnerOfWallet(ctx context.Context, walletID uuid.UUID, userID uuid.UUID, workspaceID uuid.UUID) (bool, error)
	CheckIfExists(ctx context.Context, id uuid.UUID) (bool, error)
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

func (r *walletRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.WalletDetails, error) {
	var wallet model.WalletDetails
	query := `
		SELECT
			w.id,
			w.name,
			w.description,
			w.currency,
			w.type_id,
			w.workspace_id,
			w.created_by,
			w.created_at,
			CASE
				WHEN w.type_id IS NOT NULL THEN
					jsonb_build_object(
						'id', wt.id,
						'name', wt.name
					)
				ELSE NULL
			END as wallet_type,
			CASE
				WHEN w.created_by IS NOT NULL THEN
					jsonb_build_object(
						'id', u.id,
						'first_name', u.first_name,
						'last_name', u.last_name,
						'email', u.email,
						'profile_picture_url', u.profile_picture_url
					)
				ELSE NULL
			END as user,
			COALESCE(
				(
					select jsonb_agg (
						jsonb_build_object(
							'id', le.id,
							'amount', le.amount,
							'description', le.description,
							'date', to_char(le.date, 'YYYY-MM-DD"T"00:00:00Z'),
							'direction', le.direction,
							'transaction_id', le.transaction_id
						)
					) FROM ledger_entries le
					WHERE le.wallet_id = w.id
					AND le.deleted_at IS NULL
				),'[]'::jsonb
			) as ledgerEntries
		FROM wallets as w
		LEFT JOIN wallet_types as wt ON w.type_id = wt.id
		LEFT JOIN users as u on w.created_by = u.id
		WHERE w.id = $1 AND
		w.deleted_at IS NULL
	`
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(
		&wallet.ID,
		&wallet.Name,
		&wallet.Description,
		&wallet.Currency,
		&wallet.TypeID,
		&wallet.WorkspaceID,
		&wallet.CreatedBy,
		&wallet.CreatedAt,
		&wallet.Type,
		&wallet.User,
		&wallet.LedgerEntries,
	)
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

func (r *walletRepository) CheckOwnerOfWallet(ctx context.Context, walletID uuid.UUID, userID uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	var owns bool
	err := r.db.Executor(ctx).QueryRow(ctx, "SELECT EXISTS(SELECT 1 from wallets WHERE id = $1 AND workspace_id = $2 AND created_by = $3 AND deleted_at IS NULL)", walletID, workspaceID, userID).Scan(&owns)
	return owns, err
}

func (r *walletRepository) CheckIfExists(ctx context.Context, id uuid.UUID) (bool, error) {
	var exists bool
	err := r.db.Executor(ctx).QueryRow(ctx, "SELECT EXISTS(SELECT 1 from wallets WHERE id = $1 AND deleted_at IS NULL)", id).Scan(&exists)
	return exists, err
}
