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
	CheckPendingInvitationByEmailOrUserID(ctx context.Context, email string, userID *uuid.UUID, workspaceID uuid.UUID) (bool, error)
	ListInvitations(ctx context.Context, workspaceID uuid.UUID) ([]*model.Invitation, error)
	RevokeInvite(ctx context.Context, id uuid.UUID) error
	RemoveInvite(ctx context.Context, id uuid.UUID) error
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

func(i *inviteRepository) RevokeInvite(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE invitations SET status = $1
		WHERE id = $2
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, model.InvitationStatus("revoked"), id)
	return err
}

func(i *inviteRepository) RemoveInvite(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE invitations SET deleted_at = NOW()
		WHERE id = $1
	`
	_, err := i.db.Executor(ctx).Exec(ctx, query, id)
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

func(i *inviteRepository) CheckPendingInvitationByEmailOrUserID(ctx context.Context, email string, userID *uuid.UUID, workspaceID uuid.UUID) (bool, error) {
	var exists bool
	if userID != nil {
		query := `
			SELECT EXISTS (SELECT 1
			FROM invitations WHERE (email = $1 OR user_id = $2) AND workspace_id = $3 AND status = $4)
		`

		err := i.db.Executor(ctx).QueryRow(ctx, query, email, *userID, workspaceID, model.InvitationStatus("pending")).Scan(&exists)
		if err != nil {
			return false, err
		}
	} else {
		query := `
			SELECT EXISTS (SELECT 1
			FROM invitations WHERE email = $1 AND workspace_id = $2 AND status = $3)
		`
		err := i.db.Executor(ctx).QueryRow(ctx, query, email, workspaceID, model.InvitationStatus("pending")).Scan(&exists)
		if err != nil {
			return false, err
		}
	}
	
	return exists, nil
}

func(i *inviteRepository) GetInviteByToken(ctx context.Context, token string) (*model.Invitation, error) {
	var invitation model.Invitation
	query := `
		SELECT id, workspace_id, user_id, email, role, token, expires_at, invited_by, status, accepted_at
		FROM invitations WHERE token = $1 AND status = $2 AND deleted_at IS NULL
	`

	err := i.db.Executor(ctx).QueryRow(ctx, query, token, model.InvitationStatus("pending")).Scan(&invitation.ID, &invitation.WorkspaceID, &invitation.UserID, &invitation.Email, &invitation.Role, &invitation.Token, &invitation.ExpiresAt, &invitation.InvitedBy, &invitation.Status, &invitation.AcceptedAt)
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func(i *inviteRepository) ListInvitations(ctx context.Context, workspaceID uuid.UUID) ([]*model.Invitation, error) {
	query := `
		SELECT id, workspace_id, user_id, email, role, expires_at, invited_by, status, accepted_at
		FROM invitations 
		WHERE workspace_id = $1 
		AND deleted_at IS NULL 
		AND status != 'accepted'
		AND status != 'revoked'
		AND email NOT IN (
			SELECT u.email 
			FROM workspace_members wm 
			JOIN users u ON wm.user_id = u.id 
			WHERE wm.workspace_id = $1
		)
	`
	rows, err := i.db.Executor(ctx).Query(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invitations []*model.Invitation
	for rows.Next() {
		var invitation model.Invitation
		if err := rows.Scan(&invitation.ID, &invitation.WorkspaceID, &invitation.UserID, &invitation.Email, &invitation.Role, &invitation.ExpiresAt, &invitation.InvitedBy, &invitation.Status, &invitation.AcceptedAt); err != nil {
			return nil, err
		}
		invitations = append(invitations, &invitation)
	}
	return invitations, nil
}