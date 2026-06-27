package model

import (
	"time"

	"github.com/google/uuid"
	iamModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
)

type WorkspaceRow struct {
	WorkspaceID uuid.UUID
	WorkspaceName string
	WorkspaceDescription *string
	WorkspaceType string
	WorkspaceCreatedBy uuid.UUID

	WorkspaceMemberID uuid.UUID
	WorkspaceMemberRole string
	WorkspaceMemberUserID uuid.UUID
	WorkspaceMemberCreatedBy uuid.UUID
	WorkspaceMemberJoinedAt *time.Time

	UserID uuid.UUID
	UserFirstName string
	UserLastName *string
	UserEmail string
	UserEmailVerified bool
	UserProfilePictureUrl *string
	UserIsActive bool
	UserRole string
}

type WorkspaceMemberRow struct {
	WorkspaceMemberID uuid.UUID
	WorkspaceMemberRole string
	WorkspaceMemberUserID uuid.UUID
	WorkspaceMemberCreatedBy uuid.UUID
	WorkspaceMemberJoinedAt *time.Time

	UserID uuid.UUID
	UserFirstName string
	UserLastName *string
	UserEmail string
	UserEmailVerified bool
	UserProfilePictureUrl *string
	UserIsActive bool
	UserRole string
}

type WorkspaceDetailsMember struct {
	ID uuid.UUID
	Role string
	UserID uuid.UUID
	CreatedBy uuid.UUID
	JoinedAt *time.Time
	User iamModel.User
}

type WorkspaceDetails struct {
	ID uuid.UUID
	Name string
	Description *string
	Type string
	CreatedBy uuid.UUID
	Members []WorkspaceDetailsMember
}