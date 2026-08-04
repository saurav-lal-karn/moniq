package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

// CreateWorkspaceRequestDTO carries the inputs needed to provision a workspace
// and its owner. OwnerID is populated server-side (from the authenticated user
// or the registration flow), never from the request body.
type CreateWorkspaceRequestDTO struct {
	Name        string              `json:"name" binding:"required" example:"Acme Inc."`
	Description *string             `json:"description,omitempty" example:"Workspace for Acme's finances"`
	Type        model.WorkspaceType `json:"type" binding:"required,oneof=personal family team" example:"team"`
	OwnerID     uuid.UUID           `json:"-"`
}

type UpdateWorkspaceRequestDTO struct {
	ID          string              `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name        string              `json:"name" binding:"required" example:"Acme Inc."`
	Description *string             `json:"description,omitempty" example:"Workspace for Acme's finances"`
	Type        model.WorkspaceType `json:"type" binding:"required,oneof=personal family team" example:"team"`
	OwnerID     uuid.UUID           `json:"-"`
}

type WorkspaceResponseDTO struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        string `json:"type"`
	OwnerID     string `json:"owner_id"`
}

type WorkspaceMemberDetailsResponse struct {
	ID                uuid.UUID `json:"id"`
	FirstName         string    `json:"first_name"`
	LastName          *string   `json:"last_name"`
	Email             string    `json:"email"`
	EmailVerified     bool      `json:"email_verified"`
	ProfilePictureUrl *string   `json:"profile_picture_url"`
	IsActive          bool      `json:"is_active"`
	Role              string    `json:"role"`
}

type WorkspaceMemberResponse struct {
	ID        uuid.UUID                      `json:"id"`
	Role      string                         `json:"role"`
	UserID    uuid.UUID                      `json:"user_id"`
	CreatedBy uuid.UUID                      `json:"created_by"`
	JoinedAt  *time.Time                     `json:"joined_at"`
	User      WorkspaceMemberDetailsResponse `json:"user"`
}

type WorkspaceDetailsResponse struct {
	ID          uuid.UUID                 `json:"id"`
	Name        string                    `json:"name"`
	Description *string                   `json:"description"`
	Type        string                    `json:"type"`
	OwnerID     uuid.UUID                 `json:"owner_id"`
	Members     []WorkspaceMemberResponse `json:"members"`
}

// Members dto for workspace
type CreateWorkspaceMemberDTO struct {
	UserID      string    `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
	Role        string    `json:"role" binding:"required,oneof=owner admin member" example:"member"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBY   uuid.UUID `json:"-"`
}

type UpdateWorkspaceMemberDTO struct {
	ID          string    `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440002"`
	UserID      string    `json:"user_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
	Role        string    `json:"role" binding:"required,oneof=owner admin member" example:"admin"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBY   uuid.UUID `json:"-"`
}

type InviteUserToWorkspaceDTO struct {
	Email       string    `json:"email" binding:"required" example:"member@example.test"`
	Role        string    `json:"role" binding:"required,oneof=owner admin member" example:"member"`
	WorkspaceID uuid.UUID `json:"-"`
	InvitedBy   uuid.UUID `json:"-"`
}

type AcceptDeclineInvitationDTO struct {
	Token string `json:"token" binding:"required" example:"invitation-token"`
}

type ResendInvitationDTO struct {
	ID          uuid.UUID `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440003"`
	WorkspaceID uuid.UUID `json:"-"`
	InvitedBy   uuid.UUID `json:"-"`
}

type RevokeInvitationDTO struct {
	ID uuid.UUID `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440003"`
}

type RemoveInvitationDTO struct {
	ID uuid.UUID `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440003"`
}

type InvitationResponseDTO struct {
	ID          uuid.UUID  `json:"id"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	UserID      *uuid.UUID `json:"user_id"`
	Email       string     `json:"email"`
	Role        string     `json:"role"`
	ExpiresAt   time.Time  `json:"expires_at"`
	InvitedBy   uuid.UUID  `json:"invited_by"`
	Status      string     `json:"status"`
	AcceptedAt  *time.Time `json:"accepted_at"`
}

type InvitationDetailsResponseDTO struct {
	WorkspaceName string `json:"workspace_name"`
	InviterName   string `json:"inviter_name"`
	Role          string `json:"role"`
	Email         string `json:"email"`
}
