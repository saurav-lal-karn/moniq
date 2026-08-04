package dto

import "github.com/google/uuid"

type CreateContactRequestDTO struct {
	Name        string    `json:"name" binding:"required" example:"Acme Supplies"`
	Email       string    `json:"email" example:"billing@acme.test"`
	Phone       string    `json:"phone" example:"+1-202-555-0142"`
	Address     string    `json:"address" example:"123 Main Street"`
	Type        string    `json:"type" binding:"required,oneof=lender employee client vendor other" example:"vendor"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type UpdateContactRequestDTO struct {
	ID          uuid.UUID `json:"-"`
	Name        string    `json:"name" binding:"required" example:"Acme Supplies"`
	Email       string    `json:"email" example:"billing@acme.test"`
	Phone       string    `json:"phone" example:"+1-202-555-0142"`
	Address     string    `json:"address" example:"123 Main Street"`
	Type        string    `json:"type" binding:"required,oneof=lender employee client vendor other" example:"vendor"`
	WorkspaceID uuid.UUID `json:"-"`
}

type ContactResponseDTO struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Email       *string   `json:"email"`
	Phone       *string   `json:"phone"`
	Address     *string   `json:"address"`
	Type        string    `json:"type"`
	WorkspaceID uuid.UUID `json:"workspace_id"`
	CreatedBy   uuid.UUID `json:"created_by"`
}
