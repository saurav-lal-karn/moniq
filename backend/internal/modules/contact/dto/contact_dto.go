package dto

import "github.com/google/uuid"

type CreateContactRequestDTO struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email"`
	Phone   string `json:"phone"`
	Address string `json:"address"`
	Type    string `json:"type" binding:"required,oneof=lender employee client vendor other"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type UpdateContactRequestDTO struct {
	ID      uuid.UUID `json:"-"`
	Name    string    `json:"name" binding:"required"`
	Email   string    `json:"email"`
	Phone   string    `json:"phone"`
	Address string    `json:"address"`
	Type    string    `json:"type" binding:"required,oneof=lender employee client vendor other"`
	WorkspaceID uuid.UUID `json:"-"`
}

type ContactResponseDTO struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Email       *string    `json:"email"`
	Phone       *string    `json:"phone"`
	Address     *string    `json:"address"`
	Type        string     `json:"type"`
	WorkspaceID uuid.UUID  `json:"workspace_id"`
	CreatedBy   uuid.UUID  `json:"created_by"`
}
