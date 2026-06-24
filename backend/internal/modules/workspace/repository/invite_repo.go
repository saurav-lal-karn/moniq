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
	RevokeInvite(ctx context.Context, id uuid.UUID) error
	GetInviteByID(ctx context.Context, id uuid.UUID) (*model.Invitation, error)
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
		INSERT INTO invitations(id, workspace_id, email, role, token, expires_at, invited_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, invitation.ID, invitation.WorkspaceID, invitation.Email, invitation.Role, invitation.Token, invitation.ExpiresAt, invitation.InvitedBy)
	return err
}

// RevokeInvite implements InviteRepository.
func (i *inviteRepository) RevokeInvite(ctx context.Context, id uuid.UUID) error {
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
		SELECT id, workspace_id, email, role, token, expires_at, invited_by, status, accepted_at
		FROM invitations WHERE id = $1
	`

	err := i.db.Executor(ctx).QueryRow(ctx, query, id).Scan(&invitation.ID, &invitation.WorkspaceID, &invitation.Email, &invitation.Role, &invitation.Token, &invitation.ExpiresAt, &invitation.InvitedBy, &invitation.Status, &invitation.AcceptedAt)
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}