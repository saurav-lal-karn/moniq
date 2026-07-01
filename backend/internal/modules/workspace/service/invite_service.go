package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	baseModel "github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
	iamRepo "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/repository"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/repository"
	"github.com/saurav-lal-karn/moniq/backend/pkg/logger"
	"github.com/saurav-lal-karn/moniq/backend/pkg/mailer"
)

const (
	inviteUserEmailTTL = 24 * time.Hour
	inviteUserEmailTokenBytes = 64
)

type inviteService struct {
	repo repository.InviteRepository
	workspaceRepo repository.WorkspaceRepository
	workspaceMemberRepo repository.WorkspaceMemberRepository
	iamRepo iamRepo.IAMRepository
	mailer     mailer.Mailer
	appBaseUrl string
}

type InviteService interface {
	InviteUserToWorkspace(ctx context.Context, req dto.InviteUserToWorkspaceDTO) error
	ListInvitations(ctx context.Context, workspaceID uuid.UUID) ([]*model.Invitation, error)
	AcceptInviteToWorkspace(ctx context.Context, token string) error
	DeclineInviteToWorkspace(ctx context.Context, token string) error
	RevokeInvite(ctx context.Context, invitationID uuid.UUID, userID uuid.UUID, workspaceID uuid.UUID) error
	ResendInvitation(ctx context.Context, req dto.ResendInvitationDTO) error
}

func NewInviteService(repo repository.InviteRepository, workspaceRepo repository.WorkspaceRepository, workspaceMemberRepo repository.WorkspaceMemberRepository, iamRepo iamRepo.IAMRepository, mailer mailer.Mailer, appBaseUrl string) InviteService {
	return &inviteService{
		repo: repo,
		workspaceRepo: workspaceRepo,
		workspaceMemberRepo: workspaceMemberRepo,
		iamRepo: iamRepo,
		mailer: mailer,
		appBaseUrl: appBaseUrl,
	}
}

// InviteUserToWorkspace implements InviteService.
func (i *inviteService) InviteUserToWorkspace(ctx context.Context, req dto.InviteUserToWorkspaceDTO) error {
	// Check if workspace exists
	exists, err := i.workspaceRepo.CheckWorkspaceExists(ctx,req.WorkspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check if workspace exists: %w", err)
	}

	if !exists {
		return errors.New("Workspace doesn't exist. Please check and try again")
	}

	// Check if user is allowed to send invitations
	owns, err := i.workspaceRepo.CheckOwnerOfWorkspace(ctx, req.InvitedBy, req.WorkspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check the owner of workspace: %w", err)
	}

	if !owns {
		return errors.New("You don't have permision to send invitations.")
	}

	// Check if the user is in the system by email
	userInSystem, err := i.iamRepo.CheckUserExists(ctx, req.Email)
	if err != nil {
		return fmt.Errorf("Failed to check if user exists by email: %w", err)
	}

	var userID *uuid.UUID
	if userInSystem {
		userDetails, _, err := i.iamRepo.GetByEmail(ctx, req.Email)
		if err != nil {
			return fmt.Errorf("Failed to get the user details by email: %w", err)
		}
		userID = &userDetails.ID
	
		
		// Check if user is already a member
		userAlreadyMember, err := i.workspaceMemberRepo.CheckUserExistsInWorkspace(ctx, *userID, req.WorkspaceID)
		if err != nil {
			return fmt.Errorf("Failed to check if user exists in workspace: %w", err)
		}

		if userAlreadyMember {
			return errors.New("The user is already in workspace. Please check again")
		}
	}

	// Check if the user has already been invited to the workspace
	hasPendingInvitations, err := i.repo.CheckPendingInvitationByEmailOrUserID(ctx, req.Email, userID, req.WorkspaceID)
	if err != nil {
		return fmt.Errorf("Failed to query has pending invitations: %w", err)
	}

	if hasPendingInvitations {
		return errors.New("User has been already invited to workspace and has pending invitation.")
	}

	// Generate the token
	token, err := helper.GenerateSecureToken(inviteUserEmailTokenBytes)
	if err != nil {
		return fmt.Errorf("Failed to generate the token: %w", err)
	}
	// Create invitation
	invitation := &model.Invitation{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		WorkspaceID: req.WorkspaceID,
		UserID: userID,
		Email: req.Email,
		Role: model.WorkspaceMemberRole(req.Role),
		Token: token,
		ExpiresAt: time.Now().Add(inviteUserEmailTTL),
		InvitedBy: req.InvitedBy,
		Status: "pending",
	}

	err = i.repo.InviteUserToWorkspace(ctx, invitation)
	if err != nil {
		return fmt.Errorf("Failed to create invitation: %w", err)
	}
	
	// Send email
	if err = i.sendInvitationEmail(ctx, req.Email, token); err != nil {
		logger.Error("Failed to send the verification email", logger.StringField("Email", req.Email), logger.ErrorField(err))
	}
	logger.Info("Invitation sent to email: %s",logger.StringField("Email", req.Email))
	return nil
}

func (i *inviteService) sendInvitationEmail(ctx context.Context, email string, token string) error {
	invitationUrl := fmt.Sprintf("%s/api/v1/invite?token=%s", i.appBaseUrl, token)

	return i.mailer.Send(ctx, mailer.Email{
		To:      email,
		Subject: "Invitation to Moniq",
		TextBody: fmt.Sprintf(
			"Hi,\n\nYou have been invited to Moniq! Please accept the invitation by opening the link below:\n\n%s\n\nThis link expires in %d hours.",
			invitationUrl, int(inviteUserEmailTTL.Hours()),
		),
	})
}

// AcceptInviteToWorkspace implements InviteService.
func (i *inviteService) AcceptInviteToWorkspace(ctx context.Context, token string) error {
	// Check if invitation exists
	invitation, err := i.repo.GetInviteByToken(ctx, token)
	if  err != nil {
		return fmt.Errorf("Failed to get invitation by token: %w", err)
	}

	if invitation.ID == uuid.Nil {
		return fmt.Errorf("Invitation not found. Please try again")
	}
	
	// Check if inviation is valid
	if time.Now().After(invitation.ExpiresAt) {
		return fmt.Errorf("Invitation has expired. Please contact admin")
	}

	// Accept the invitation
	err = i.repo.AcceptInvite(ctx, invitation.ID)
	if err != nil {
		return fmt.Errorf("Failed to accept invite: %w", err)
	}

	// Create the user
	return nil
}

// DeclineInviteToWorkspace implements InviteService.
func (i *inviteService) DeclineInviteToWorkspace(ctx context.Context, token string) error {
	// Check if invitation exists
	invitation, err := i.repo.GetInviteByToken(ctx, token)
	if  err != nil {
		return fmt.Errorf("Failed to get invitation by token: %w", err)
	}

	if invitation.ID == uuid.Nil {
		return fmt.Errorf("Invitation not found. Please try again")
	}
	
	// Check if inviation is valid
	if time.Now().After(invitation.ExpiresAt) {
		return fmt.Errorf("Invitation has expired. Please contact admin")
	}

	// Reject the invitation
	err = i.repo.RejectInvite(ctx, invitation.ID)
	if err != nil {
		return fmt.Errorf("Failed to decline invite: %w", err)
	}
	
	return nil
}

func(i *inviteService) RevokeInvite(ctx context.Context, invitationID uuid.UUID, userID uuid.UUID, workspaceID uuid.UUID) error {
	// Check if workspace exists
	exists, err := i.workspaceRepo.CheckWorkspaceExists(ctx, workspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check if workspace exists: %w", err)
	}

	if !exists {
		return errors.New("Workspace doesn't exist. Please check and try again")
	}

	// Check if user is allowed to send invitations
	owns, err := i.workspaceRepo.CheckOwnerOfWorkspace(ctx, userID, workspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check the owner of workspace: %w", err)
	}

	if !owns {
		return errors.New("You don't have permision to send invitations.")
	}

	invitation, err := i.repo.GetInviteByID(ctx, invitationID)
	if err != nil {
		return fmt.Errorf("Failed to check if invitation exists: %w", err)
	}

	if invitation.ID == uuid.Nil {
		return fmt.Errorf("Invitation not found. Please try again")
	}

	// Reject the invitation
	err = i.repo.RevokeInvite(ctx, invitationID)
	if err != nil {
		return fmt.Errorf("Failed to revoke invite: %w", err)
	}
	
	return nil
}

func(i *inviteService) ListInvitations(ctx context.Context, workspaceID uuid.UUID) ([]*model.Invitation, error) {
	// Check workspace exists or not
	// Check if workspace exists
	exists, err := i.workspaceRepo.CheckWorkspaceExists(ctx, workspaceID)
	if err != nil {
		return nil, fmt.Errorf("Failed to check if workspace exists: %w", err)
	}

	if !exists {
		return nil, errors.New("Workspace doesn't exist. Please check and try again")
	}

	invitations, err := i.repo.ListInvitations(ctx, workspaceID)
	if err != nil {
		return nil, err
	}

	// Get the list of invitations
	return invitations, nil
}

func(i *inviteService) ResendInvitation(ctx context.Context, req dto.ResendInvitationDTO) error {
	// Check if workspace exists
	exists, err := i.workspaceRepo.CheckWorkspaceExists(ctx,req.WorkspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check if workspace exists: %w", err)
	}

	if !exists {
		return errors.New("Workspace doesn't exist. Please check and try again")
	}

	// Check if user is allowed to send invitations
	owns, err := i.workspaceRepo.CheckOwnerOfWorkspace(ctx, req.InvitedBy, req.WorkspaceID)
	if err != nil {
		return fmt.Errorf("Failed to check the owner of workspace: %w", err)
	}

	if !owns {
		return errors.New("You don't have permision to send invitations.")
	}

	// Check if earlier invitation exists
	existingInvitation, err := i.repo.GetInviteByID(ctx, req.ID)
	if err != nil {
		return fmt.Errorf("Failed to check if earlier invitation exists: %w", err)
	}

	if existingInvitation.ID == uuid.Nil {
		return errors.New("Invitation not found. Please check and try again")
	}

	// Generate the token
	token, err := helper.GenerateSecureToken(inviteUserEmailTokenBytes)
	if err != nil {
		return fmt.Errorf("Failed to generate the token: %w", err)
	}
	// Re-Create new invitation
	invitation := &model.Invitation{
		BaseModel: baseModel.BaseModel{ID: uuid.New()},
		WorkspaceID: req.WorkspaceID,
		UserID: existingInvitation.UserID,
		Email: existingInvitation.Email,
		Role: model.WorkspaceMemberRole(existingInvitation.Role),
		Token: token,
		ExpiresAt: time.Now().Add(inviteUserEmailTTL),
		InvitedBy: req.InvitedBy,
		Status: "pending",
	}

	err = i.repo.InviteUserToWorkspace(ctx, invitation)
	if err != nil {
		return fmt.Errorf("Failed to create invitation: %w", err)
	}

	// Update earlier invitation
	err = i.repo.RevokeInvite(ctx, req.ID)
	if err != nil {
		return fmt.Errorf("Failed to update earlier invitation: %w", err)
	}
	
	// Send email
	if err = i.sendInvitationEmail(ctx, existingInvitation.Email, token); err != nil {
		logger.Error("Failed to send the verification email", logger.StringField("Email", existingInvitation.Email), logger.ErrorField(err))
	}
	logger.Info("Invitation sent to email: %s",logger.StringField("Email", existingInvitation.Email))
	return nil
}