package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type WorkspaceType string
const (
	PersonalWorkspace WorkspaceType = "personal"
	FamilyWorkspace   WorkspaceType = "family"
	TeamWorkspace     WorkspaceType = "team"
)

type WorkspaceMemberRole string
const (
	OwnerRole WorkspaceMemberRole = "owner"
	AdminRole WorkspaceMemberRole = "admin"
	MemberRole WorkspaceMemberRole = "member"
)

type Workspace struct {
	model.BaseModel
	Name string
	Description *string
	Type WorkspaceType
	CreatedBy uuid.UUID
}

type WorkspaceMember struct {
	model.BaseModel
	WorkspaceID uuid.UUID
	UserID uuid.UUID
	Role WorkspaceMemberRole
	CreatedBy uuid.UUID
}

type Invitation struct {
	model.BaseModel
	WorkspaceID uuid.UUID
	Email string
	Role WorkspaceMemberRole
	Token string
	ExpiresAt time.Time
	AcceptedAt *time.Time
	InvitedBy uuid.UUID
}