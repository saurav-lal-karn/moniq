package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	workspaceModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

type workspaceMemberRepository struct {
	db database.DB
}

type WorkspaceMemberRepository interface {
	AddMemberToWorkspace(ctx context.Context, member *workspaceModel.WorkspaceMember) error
	RemoveMemberFromWorkspace(ctx context.Context, memberID uuid.UUID, workspaceID uuid.UUID) error
	ListMemberInWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*workspaceModel.WorkspaceMember, error)
	UpdateMemberInWorkspace(ctx context.Context, memberID uuid.UUID, member *workspaceModel.WorkspaceMember) error
	CheckUserExistsInWorkspace(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) (bool, error)
}

func NewWorkspaceMemberRepository(db database.DB) WorkspaceMemberRepository {
	return &workspaceMemberRepository{
		db: db,
	}
}

// AddMemberToWorkspace implements WorkspaceMemberRepository.
func (w *workspaceMemberRepository) AddMemberToWorkspace(ctx context.Context, member *workspaceModel.WorkspaceMember) error {
	// joined_at, created_at and updated_at fall back to their column defaults.
	query := `
		INSERT INTO workspace_members (id, role, workspace_id, user_id, created_by)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err := w.db.Executor(ctx).Exec(ctx, query, member.ID, member.Role, member.WorkspaceID, member.UserID, member.CreatedBy)
	return err
}

// ListMemberInWorkspace implements WorkspaceMemberRepository.
func (w *workspaceMemberRepository) ListMemberInWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*workspaceModel.WorkspaceMember, error) {
	rows, err := w.db.Executor(ctx).Query(ctx, "SELECT * from workspace_members WHERE workspace_id = $1", workspaceID)
	if err != nil {
		return nil, err
	}

	var members []*workspaceModel.WorkspaceMember
	for rows.Next() {
		var member workspaceModel.WorkspaceMember
		if err := rows.Scan(&member.ID, &member.UserID, &member.WorkspaceID, &member.Role, &member.CreatedBy); err != nil {
			return nil, err
		}
		members = append(members, &member)
	}
	return members, nil
}

// RemoveMemberFromWorkspace implements WorkspaceMemberRepository.
func (w *workspaceMemberRepository) RemoveMemberFromWorkspace(ctx context.Context, memberID uuid.UUID, workspaceID uuid.UUID) error {
	_, err := w.db.Executor(ctx).Exec(ctx, "DELETE FROM workspace_members WHERE user_id = $1 AND workspace_id = $2", memberID, workspaceID)
	return err
}

// UpdateMemberInWorkspace implements WorkspaceMemberRepository.
func (w *workspaceMemberRepository) UpdateMemberInWorkspace(ctx context.Context, memberID uuid.UUID, member *workspaceModel.WorkspaceMember) error {
	_, err := w.db.Executor(ctx).Exec(ctx, "UPDATE workspace_members set role = $1 where user_id = $2 and workspace_id = $3", &member.Role, memberID, &member.WorkspaceID)
	return err
}

// CheckUserExistsInWorkspace implements WorkspaceMemberRepository.
func (w *workspaceMemberRepository) CheckUserExistsInWorkspace(ctx context.Context, userID uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	var exists bool
	err := w.db.Executor(ctx).QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM workspace_members WHERE user_id = $1 and workspace_id = $2)", userID, workspaceID).Scan(&exists)
	return exists, err
}