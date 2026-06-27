package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	iamModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
	workspaceModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

type workspaceMemberRepository struct {
	db database.DB
}

type WorkspaceMemberRepository interface {
	AddMemberToWorkspace(ctx context.Context, member *workspaceModel.WorkspaceMember) error
	RemoveMemberFromWorkspace(ctx context.Context, memberID uuid.UUID, workspaceID uuid.UUID) error
	ListMembersInWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*workspaceModel.WorkspaceDetailsMember, error)
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
func (w *workspaceMemberRepository) ListMembersInWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*workspaceModel.WorkspaceDetailsMember, error) {
	query := `
		SELECT 
			wms.id, 
			wms.role,
			wms.user_id,
			wms.created_by,
			wms.joined_at,
			u.id,
			u.first_name,
			u.last_name,
			u.email,
			u.email_verified,
			u.profile_picture_url,
			u.is_active,
			u.role as user_role
		FROM workspace_members wms
		LEFT JOIN users u ON wms.user_id = u.id
		WHERE workspace_id = $1
	`
	rows, err := w.db.Executor(ctx).Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*workspaceModel.WorkspaceDetailsMember
	for rows.Next() {
		var r workspaceModel.WorkspaceMemberRow
		if err := rows.Scan(
			&r.WorkspaceMemberID, &r.WorkspaceMemberRole, &r.WorkspaceMemberUserID, &r.WorkspaceMemberCreatedBy, &r.WorkspaceMemberJoinedAt, &r.UserID, &r.UserFirstName, &r.UserLastName, &r.UserEmail, &r.UserEmailVerified, &r.UserProfilePictureUrl, &r.UserIsActive, &r.UserRole,
		); err != nil {
			return nil, err
		}
		if r.WorkspaceMemberID != uuid.Nil && r.UserID != uuid.Nil {
			members = append(members, &workspaceModel.WorkspaceDetailsMember{
				ID: r.WorkspaceMemberID,
				Role: r.WorkspaceMemberRole,
				UserID: r.WorkspaceMemberUserID,
				CreatedBy: r.WorkspaceMemberCreatedBy,
				JoinedAt: r.WorkspaceMemberJoinedAt,
				User: iamModel.User{
					ID: r.UserID,
					FirstName: r.UserFirstName,
					LastName: r.UserLastName,
					Email: r.UserEmail,
					EmailVerified: r.UserEmailVerified,
					ProfilePictureURL: r.UserProfilePictureUrl,
					IsActive: r.UserIsActive,
					Role: iamModel.UserRole(r.UserRole),
				},
			})
		}
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