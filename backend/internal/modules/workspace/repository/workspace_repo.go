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
	ListMyWorkspaces(ctx context.Context, userID string) ([]*workspaceModel.Workspace, error)
	UpdateWorkspace(ctx context.Context, workspaceID string, workspace *workspaceModel.Workspace) error
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

func (r *workspaceRepository) ListMyWorkspaces(ctx context.Context, userID string) ([]*workspaceModel.Workspace, error) {
	query := `
		SELECT 
			workspaces.id,
			workspaces.name,
			workspaces.type,
			workspaces.description,
			workspaces.created_by 
		FROM workspaces
		LEFT JOIN workspace_members ON workspace_members.workspace_id = workspaces.id
		WHERE workspace_members.user_id = $1
		AND workspaces.deleted_at IS NULL
		AND workspace_members.deleted_at IS NULL
	`
	rows, err := r.db.Executor(ctx).Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workspaces []*workspaceModel.Workspace
	for rows.Next() {
		var workspace workspaceModel.Workspace
		if err := rows.Scan(&workspace.ID, &workspace.Name, &workspace.Type, &workspace.Description, &workspace.CreatedBy); err != nil {
			return nil, err
		}

		workspaces = append(workspaces, &workspace)
	}
	return workspaces, nil // Placeholder return statement
}

func (r *workspaceRepository) UpdateWorkspace(ctx context.Context, workspaceID string, workspace *workspaceModel.Workspace) error {
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

