package dto

import "github.com/google/uuid"

type CreateWalletRequestDTO struct {
	Name        string    `json:"name" binding:"required" example:"Main Wallet"`
	TypeID      uuid.UUID `json:"type_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Currency    string    `json:"currency" binding:"required" example:"USD"`
	Description string    `json:"description" example:"Primary business wallet"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type UpdateWalletRequestDTO struct {
	ID          uuid.UUID `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440001"`
	Name        string    `json:"name" binding:"required" example:"Main Wallet"`
	TypeID      uuid.UUID `json:"type_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	Currency    string    `json:"currency" binding:"required" example:"USD"`
	Description string    `json:"description" example:"Primary business wallet"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type CreateWalletTypeRequestDTO struct {
	Name        string    `json:"name" binding:"required" example:"Cash"`
	Description string    `json:"description" example:"Cash on hand"`
	WorkspaceID uuid.UUID `json:"-"`
	CreatedBy   uuid.UUID `json:"-"`
}

type WalletTypeResponseDTO struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description *string    `json:"description"`
	WorkspaceID *uuid.UUID `json:"workspace_id"`
	CreatedBy   *uuid.UUID `json:"created_by"`
}

type WalletResponseDTO struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	WorkspaceID uuid.UUID `json:"workspace_id"`
	CreatedBy   uuid.UUID `json:"created_by"`
	TypeID      uuid.UUID `json:"type_id"`
	Currency    string    `json:"currency"`
}
