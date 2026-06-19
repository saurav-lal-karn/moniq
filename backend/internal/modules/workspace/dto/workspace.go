package dto

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

// CreateWorkspaceRequestDTO carries the inputs needed to provision a workspace
// and its owner. OwnerID is populated server-side (from the authenticated user
// or the registration flow), never from the request body.
type CreateWorkspaceRequestDTO struct {
	Name        string              `json:"name" validate:"required"`
	Description *string             `json:"description,omitempty"`
	Type        model.WorkspaceType `json:"type" validate:"required,oneof=personal family team"`
	OwnerID     uuid.UUID           `json:"-"`
}

type WorkspaceResponseDTO struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
	Type string `json:"type"`
	OwnerID string `json:"owner_id"`
}