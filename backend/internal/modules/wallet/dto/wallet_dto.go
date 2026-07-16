package dto

import "github.com/google/uuid"

type CreateWalletRequestDTO struct {
	Name        string    `json:"name" binding:"required"`
	TypeID      uuid.UUID `json:"type_id" binding:"required"`
	Currency    string    `json:"currency" binding:"required"`
	Description string    `json:"description"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type CreateWalletTypeRequestDTO struct {
	Name string `json:"name" binding:"required"`
	Description string `json:"description"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy uuid.UUID `json:"-"`
}

type WalletTypeResponseDTO struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Description *string `json:"description"`
	WorkspaceID *uuid.UUID `json:"workspace_id"`
	CreatedBy *uuid.UUID `json:"created_by"`
}

type WalletResponseDTO struct {
	ID string `json:"id"`
	Name string `json:"name"`
	Description *string `json:"description"`
	WorkspaceID uuid.UUID `json:"workspace_id"`
	CreatedBy uuid.UUID `json:"created_by"`
	TypeID uuid.UUID `json:"type_id"`
	Currency string `json:"currency"`
}
	