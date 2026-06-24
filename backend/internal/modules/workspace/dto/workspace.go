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
	Name        string              `json:"name" binding:"required"`
	Description *string             `json:"description,omitempty"`
	Type        model.WorkspaceType `json:"type" binding:"required,oneof=personal family team"`
	OwnerID     uuid.UUID           `json:"-"`
}

type UpdateWorkspaceRequestDTO struct {
	ID 			string 				`json:"id" binding:"required"`
	Name        string              `json:"name" binding:"required"`
	Description *string             `json:"description,omitempty"`
	Type        model.WorkspaceType `json:"type" binding:"required,oneof=personal family team"`
	OwnerID     uuid.UUID           `json:"-"`
}

type WorkspaceResponseDTO struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
	Type string `json:"type"`
	OwnerID string `json:"owner_id"`
}

type WorkspaceMemberDetailsResponse struct {
	ID uuid.UUID `json:"id"`
	FirstName string `json:"first_name"`
	LastName *string `json:"last_name"`
	Email string `json:"email"`
	EmailVerified bool `json:"email_verified"`
	ProfilePictureUrl *string `json:"profile_picture_url"`
	IsActive bool `json:"is_active"`
	Role string `json:"role"`
}

type WorkspaceMemberResponse struct {
	ID uuid.UUID `json:"id"`
	Role string `json:"role"`
	UserID uuid.UUID `json:"user_id"`
	CreatedBy uuid.UUID `json:"created_by"`
	JoinedAt *time.Time `json:"joined_at"`
	User WorkspaceMemberDetailsResponse `json:"user"`
}

type WorkspaceDetailsResponse struct {
	ID uuid.UUID `json:"id"`
	Name string `json:"name"`
	Description *string `json:"description"`
	Type string `json:"type"`
	OwnerID uuid.UUID `json:"owner_id"`
	Members []WorkspaceMemberResponse `json:"members"`
}

// Members dto for workspace
type CreateWorkspaceMemberDTO struct {
	UserID string `json:"user_id" binding:"required"`
	Role string `json:"role" binding:"required,oneof=owner admin member"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBY uuid.UUID `json:"-"`
}

type UpdateWorkspaceMemberDTO struct {
	ID string `json:"id" binding:"required"`
	UserID string `json:"user_id" binding:"required"`
	Role string `json:"role" binding:"required,oneof=owner admin member"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBY uuid.UUID `json:"-"`
}

type InviteUserToWorkspaceDTO struct {
	Email string `json:"email" binding:"required"`
	Role string `json:"role" binding:"required,oneof=owner admin member"`
	WorkspaceID uuid.UUID `json:"-"`
	InvitedBy uuid.UUID `json:"-"`
}