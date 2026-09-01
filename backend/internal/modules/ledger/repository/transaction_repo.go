package repository

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/ledger/model"
)

type transactionRepository struct {
	db database.DB
}

type TransactionRepository interface {
	Create(ctx context.Context, tx *model.Transaction) error
	List(ctx context.Context, workspaceID uuid.UUID, req *helper.PaginationRequest) ([]*model.TransactionDetails, int, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionDetails, error)
	Update(ctx context.Context, tx *model.Transaction) error
	Delete(ctx context.Context, id uuid.UUID) error
	CheckIfExists(ctx context.Context, id uuid.UUID, workspaceID uuid.UUID) (bool, error)
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

func (r *transactionRepository) List(ctx context.Context, workspaceID uuid.UUID, req *helper.PaginationRequest) ([]*model.TransactionDetails, int, error) {
	// Sorting
	var allowedSortFields = map[string]string{
		"amount": "t.amount",
		"date": "t.date",
		"description": "t.description",
		"created_at": "t.created_at",
	}

	sortColumn, ok := allowedSortFields[req.Sort]
	if !ok {
		sortColumn = "t.date"
	}

	// Ordering
	order := strings.ToUpper(req.Order)
	if order != "ASC" && order != "DESC" {
		order = "DESC"
	}

	// conditions
	conditions := []string{
		"t.workspace_id = $1",
		"t.deleted_at IS NULL",
	}
	args := []any{workspaceID}

	// Search
	if req.Search != "" {
		conditions = append(conditions, fmt.Sprintf("t.description ILIKE $%d", len(args)+1))
		args = append(args, "%"+req.Search+"%")
	}
	
	whereClause := strings.Join(conditions, " AND ")

	// ---------------------------------------------------------
	// 3. Get total count
	// ---------------------------------------------------------

	countQuery := fmt.Sprintf(`
		SELECT COUNT(*)
		FROM transactions t
		WHERE %s
	`, whereClause)

	var total int

	err := r.db.Executor(ctx).QueryRow(
		ctx,
		countQuery,
		args...,
	).Scan(&total)

	if err != nil {
		return nil, 0, err
	}

	limitClause := fmt.Sprintf("LIMIT $%d", len(args)+1)
	offsetClause := fmt.Sprintf("OFFSET $%d", len(args)+2)
	args = append(args, req.Limit, req.Offset)

	fmt.Println("Hello world")
	fmt.Println("limitClause ", limitClause)
	fmt.Println("offsetClause ", offsetClause)

	query := fmt.Sprintf(`
		SELECT
			t.id as transaction_id,
			t.amount as transaction_amount,
			t.date as transaction_date,
			t.description as transaction_description,
			t.type as transaction_type,
			t.wallet_id as transaction_wallet_id,
			t.contact_id as transaction_contact_id,
			t.workspace_id as transaction_workspace_id,
			t.created_by as transaction_created_by,
			CASE
				WHEN w.id IS NOT NULL THEN
					jsonb_build_object(
						'id', w.id,
						'name', w.name
					)
				ELSE NULL
			END AS wallet,
			CASE
				WHEN c.id IS NOT NULL THEN
					jsonb_build_object(
						'id', c.id,
						'name', c.name
					)
				ELSE NULL
			END AS contact,
			COALESCE(
				(
					SELECT jsonb_agg(
						jsonb_build_object(
							'id', ti.id,
							'name', ti.name,
							'quantity', ti.quantity,
							'price', ti.price,
							'total', ti.total
						)
						ORDER BY ti.id
					)
					FROM transaction_items ti
					WHERE ti.transaction_id = t.id
					AND ti.deleted_at IS NULL
				),
				'[]'::jsonb
			) AS items,
			 COALESCE(
				(
					SELECT jsonb_agg(
						jsonb_build_object(
							'id', tg.id,
							'name', tg.name
						)
						ORDER BY tg.name
					)
					FROM transaction_tags tt
					JOIN tags tg
						ON tg.id = tt.tag_id
					WHERE tt.transaction_id = t.id
				),
				'[]'::jsonb
			) AS tags
		FROM transactions as t
		LEFT JOIN wallets w ON t.wallet_id = w.id AND w.deleted_at IS NULL
		LEFT JOIN contacts c ON t.contact_id = c.id AND c.deleted_at IS NULL
		WHERE %s
		ORDER BY %s %s
		%s
		%s
	`, whereClause, sortColumn, order, limitClause, offsetClause)

	fmt.Println(query)
	fmt.Println(args...)

	rows, err := r.db.Executor(ctx).Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	transactions := make([]*model.TransactionDetails, 0)

	for rows.Next() {
		var t model.TransactionDetails
		if err := rows.Scan(
			&t.ID,
			&t.Amount,
			&t.Date,
			&t.Description,
			&t.Type,
			&t.WalletID,
			&t.ContactID,
			&t.WorkspaceID,
			&t.CreatedBy,
			&t.Wallet,
			&t.Contact,
			&t.Items,
			&t.Tags,
		); err != nil {
			return nil, 0, err
		}
		transactions = append(transactions, &t)
	}

	return transactions, total, nil
}

func (r *transactionRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.TransactionDetails, error) {
	query := `
		SELECT
			t.id,
			t.amount,
			t.date,
			t.description,
			t.type,
			t.wallet_id,
			t.contact_id,
			t.workspace_id,
			t.created_by,
			CASE
				WHEN w.id IS NOT NULL THEN
					jsonb_build_object(
						'id', w.id,
						'name', w.name
					)
				ELSE NULL
			END AS wallet,
			CASE
				WHEN c.id IS NOT NULL THEN
					jsonb_build_object(
						'id', c.id,
						'name', c.name
					)
				ELSE NULL
			END AS contact,
			COALESCE(
				(
					SELECT jsonb_agg(
						jsonb_build_object(
							'id', ti.id,
							'name', ti.name,
							'quantity', ti.quantity,
							'price', ti.price,
							'total', ti.total
						)
						ORDER BY ti.id
					)
					FROM transaction_items ti
					WHERE ti.transaction_id = t.id
					AND ti.deleted_at IS NULL
				),
				'[]'::jsonb
			) AS items,
			 COALESCE(
				(
					SELECT jsonb_agg(
						jsonb_build_object(
							'id', tg.id,
							'name', tg.name
						)
						ORDER BY tg.name
					)
					FROM transaction_tags tt
					JOIN tags tg
						ON tg.id = tt.tag_id
					WHERE tt.transaction_id = t.id
				),
				'[]'::jsonb
			) AS tags
		FROM transactions as t
		LEFT JOIN wallets w ON t.wallet_id = w.id AND w.deleted_at IS NULL
		LEFT JOIN contacts c ON t.contact_id = c.id AND c.deleted_at IS NULL
		WHERE t.id = $1 AND t.deleted_at IS NULL
	`

	var tx model.TransactionDetails
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(
		&tx.ID,
		&tx.Amount,
		&tx.Date,
		&tx.Description,
		&tx.Type,
		&tx.WalletID,
		&tx.ContactID,
		&tx.WorkspaceID,
		&tx.CreatedBy,
		&tx.Wallet,
		&tx.Contact,
		&tx.Items,
		&tx.Tags,
	)
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

func (r *transactionRepository) CheckIfExists(ctx context.Context, id uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	query := `
		SELECT EXISTS(SELECT 1 FROM transactions WHERE id = $1 AND workspace_id = $2 AND deleted_at IS NULL)
	`
	var exists bool
	err := r.db.Executor(ctx).QueryRow(ctx, query, id, workspaceID).Scan(&exists)
	return exists, err
}