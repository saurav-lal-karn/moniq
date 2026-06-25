package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/database"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

type inviteRepository struct {
	db database.DB
}

type InviteRepository interface {
	InviteUserToWorkspace(ctx context.Context,invitation *model.Invitation) error
	AcceptInvite(ctx context.Context, id uuid.UUID) error
	RejectInvite(ctx context.Context, id uuid.UUID) error
	GetInviteByID(ctx context.Context, id uuid.UUID) (*model.Invitation, error)
	GetInviteByToken(ctx context.Context, token string) (*model.Invitation, error)
	CheckPendingInvitationByEmailOrUserID(ctx context.Context, email string, userID uuid.UUID, workspaceID uuid.UUID) (bool, error)
}

func NewInviteRepository(db database.DB) InviteRepository {
	return &inviteRepository{
		db: db,
	}
}

// AcceptInvite implements InviteRepository.
func (i *inviteRepository) AcceptInvite(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE invitations SET status = $1, accepted_at = NOW()
		WHERE id = $2
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, model.InvitationStatus("accepted"), id)
	return err
}

// InviteUserToWorkspace implements InviteRepository.
func (i *inviteRepository) InviteUserToWorkspace(ctx context.Context, invitation *model.Invitation) error {
	query := `
		INSERT INTO invitations(id, workspace_id, user_id, email, role, token, expires_at, invited_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, invitation.ID, invitation.WorkspaceID, invitation.UserID, invitation.Email, invitation.Role, invitation.Token, invitation.ExpiresAt, invitation.InvitedBy)
	return err
}

// RevokeInvite implements InviteRepository.
func (i *inviteRepository) RejectInvite(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE invitations SET status = $1
		WHERE id = $2
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, model.InvitationStatus("rejected"), id)
	return err
}

func(i *inviteRepository) GetInviteByID(ctx context.Context, id uuid.UUID) (*model.Invitation, error) {
	var invitation model.Invitation
	query := `
		SELECT id, workspace_id, user_id, email, role, token, expires_at, invited_by, status, accepted_at
		FROM invitations WHERE id = $1 AND deleted_at IS NULL
	`

	err := i.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&invitation.ID, &invitation.WorkspaceID, &invitation.UserID, &invitation.Email, &invitation.Role, &invitation.Token, &invitation.ExpiresAt, &invitation.InvitedBy, &invitation.Status, &invitation.AcceptedAt)
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func(i *inviteRepository) CheckPendingInvitationByEmailOrUserID(ctx context.Context, email string, userID uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (SELECT 1
		FROM invitations WHERE (email = $1 OR user_id = $2) AND workspace_id = $3 AND status = $4)
	`

	err := i.db.Executor(ctx).QueryRow(ctx, query, email, userID, workspaceID, model.InvitationStatus("pending")).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func(i *inviteRepository) GetInviteByToken(ctx context.Context, token string) (*model.Invitation, error) {
	var invitation model.Invitation
	query := `
		SELECT id, workspace_id, user_id, email, role, token, expires_at, invited_by, status, accepted_at
		FROM invitations WHERE token = $1 AND deleted_at IS NULL
	`

	err := i.db.Executor(ctx).QueryRow(ctx, query, token).Scan(&invitation.ID, &invitation.WorkspaceID, &invitation.UserID, &invitation.Email, &invitation.Role, &invitation.Token, &invitation.ExpiresAt, &invitation.InvitedBy, &invitation.Status, &invitation.AcceptedAt)
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}