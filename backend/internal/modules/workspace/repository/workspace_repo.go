package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	workspaceModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

type workspaceRepository struct {
	db database.DB
}

type WorkspaceRepository interface {
	// Define methods for workspace-related database operations here
	CreateWorkspace(ctx context.Context, workspace *workspaceModel.Workspace) error
	List(ctx context.Context) error
	UpdateWorkspace(ctx context.Context) error
	DeleteWorkspace(ctx context.Context, workspaceID uuid.UUID) error
	CheckOwnerOfWorkspace(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) (bool, error)
}

func NewWorkspaceRepository(db database.DB) WorkspaceRepository {
	return &workspaceRepository{
		db: db,
	}
}

func (r *workspaceRepository) CreateWorkspace(ctx context.Context, workspace *workspaceModel.Workspace) error {
	query := `
		INSERT INTO workspaces(id, name, description, type, created_by)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Executor(ctx).Exec(ctx, query, workspace.ID, workspace.Name, workspace.Description, workspace.Type, workspace.CreatedBy)
	return err
}

func (r *workspaceRepository) List(ctx context.Context) error {
	return nil // Placeholder return statement
}

func (r *workspaceRepository) UpdateWorkspace(ctx context.Context) error {
	return nil // Placeholder return statement
}

func (r *workspaceRepository) DeleteWorkspace(ctx context.Context, workspaceID uuid.UUID) error {
	_, err := r.db.Executor(ctx).Exec(ctx, "DELETE FROM workspaces where id = $1", workspaceID)
	return err
}

func (r *workspaceRepository) CheckOwnerOfWorkspace(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	var owns bool
	err := r.db.Executor(ctx).QueryRow(ctx, "SELECT EXISTS(SELECT 1 from workspaces WHERE id = $1 AND created_by = $2)", workspaceID, userID).Scan(&owns)
	return owns, err
}

