package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/model"
)

type contactRepository struct {
	db *pgxpool.Pool
}

type ContactRepository interface {
	// Define methods for contact-related database operations here
	Create(ctx context.Context, contact *model.Contact) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Contact, error)
	List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Contact, error)
	Update(ctx context.Context, contact *model.Contact) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewContactRepository(db *pgxpool.Pool) ContactRepository {
	return &contactRepository{
		db: db,
	}
}

func (r *contactRepository) Create(ctx context.Context, contact *model.Contact) error {
	query := `
		INSERT INTO contacts(id, name, email, phone, address, type, workspace_id, created_by)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.Exec(ctx, query, contact.ID, contact.Name, contact.Email, contact.Phone, contact.Address, contact.Type, contact.WorkspaceID, contact.CreatedBy)
	return err
}

func (r *contactRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Contact, error) {
	var contact model.Contact
	query := `
		SELECT id, name, email, phone, address, type, workspace_id, created_by
		FROM contacts WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.QueryRow(ctx, query, id).Scan(&contact.ID, &contact.Name, &contact.Email, &contact.Phone, &contact.Address, &contact.Type, &contact.WorkspaceID, &contact.CreatedBy)
	if err != nil {
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepository) List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Contact, error) {
	query := `
		SELECT id, name, email, phone, address, type, workspace_id, created_by
		FROM contacts WHERE deleted_at IS NULL AND (workspace_id = $1 OR workspace_id IS NULL OR $1 IS NULL)
	`
	rows, err := r.db.Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []*model.Contact
	for rows.Next() {
	    var contact model.Contact
	    if err := rows.Scan(&contact.ID, &contact.Name, &contact.Email, &contact.Phone, &contact.Address, &contact.Type, &contact.WorkspaceID, &contact.CreatedBy); err != nil {
	        return nil, err
	    }
	    contacts = append(contacts, &contact)
	}

	return contacts, nil
}

func (r *contactRepository) Update(ctx context.Context, contact *model.Contact) error {
	query := `
		UPDATE contacts SET name = $1, email = $2, phone = $3, address = $4, type = $5, workspace_id = $6 WHERE id = $7
	`
	
	_, err := r.db.Exec(ctx, query, contact.Name, contact.Email, contact.Phone, contact.Address, contact.Type, contact.WorkspaceID, contact.ID)
	return err
}

func (r *contactRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE contacts SET deleted_at = NOW() WHERE id = $1
	`
	_, err := r.db.Exec(ctx, query, id)
	return err
}