package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/model"
)

type tagRepository struct {
	db database.DB
}

type TagRepository interface {
	Create(ctx context.Context, tag *model.Tag) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Tag, error)
	List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Tag, error)
	Update(ctx context.Context, tag *model.Tag) error
	Delete(ctx context.Context, id uuid.UUID) error
}

func NewTagRepository(db database.DB) TagRepository {
	return &tagRepository{
		db: db,
	}
}

func (r *tagRepository) Create(ctx context.Context, tag *model.Tag) error {
	query := `
		INSERT INTO tags(id, name, workspace_id, created_by)
		VALUES($1, $2, $3, $4)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, tag.ID, tag.Name, tag.WorkspaceID, tag.CreatedBy)
	return err
}

func (r *tagRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Tag, error) {
	var tag model.Tag
	query := `
		SELECT id, name, workspace_id, created_by
		FROM tags WHERE id = $1 AND deleted_at IS NULL
	`
	err := r.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&tag.ID, &tag.Name, &tag.WorkspaceID, &tag.CreatedBy)
	if err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepository) List(ctx context.Context, workspaceID *uuid.UUID) ([]*model.Tag, error) {
	query := `
		SELECT id, name, workspace_id, created_by
		FROM tags WHERE deleted_at IS NULL AND (workspace_id = $1 OR workspace_id IS NULL OR $1 IS NULL)
	`
	
	rows, err := r.db.Executor(ctx).Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tags []*model.Tag
	for rows.Next() {
		var tag model.Tag
		if err := rows.Scan(&tag.ID, &tag.Name, &tag.WorkspaceID, &tag.CreatedBy); err != nil {
			return nil, err
		}
		tags = append(tags, &tag)
	}
	return tags, nil
}

func (r *tagRepository) Update(ctx context.Context, tag *model.Tag) error {
	query := `
		UPDATE tags SET name = $1, workspace_id = $2 WHERE id = $3
	`
	
	_, err := r.db.Executor(ctx).Exec(ctx, query, tag.Name, tag.WorkspaceID, tag.ID)
	return err
}

func (r *tagRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE tags SET deleted_at = NOW() WHERE id = $1
	`
	
	_, err := r.db.Executor(ctx).Exec(ctx, query, id)
	return err
}