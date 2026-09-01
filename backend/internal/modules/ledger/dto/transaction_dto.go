package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
)

type TransactionItemRequestDTO struct {
	Name     string  `json:"name" binding:"required" example:"Office supplies"`
	Quantity float64 `json:"quantity" binding:"required" example:"2"`
	Price    float64 `json:"price" binding:"required" example:"12.50"`
	Total    float64 `json:"total" binding:"required" example:"25.00"`
}

type CreateTransactionRequestDTO struct {
	Amount              float64                     `json:"amount" binding:"required" example:"25.00"`
	Date                helper.Date                 `json:"date" binding:"required" swaggertype:"string" example:"2026-01-20"`
	Description         *string                     `json:"description" example:"Stationery for the office"`
	Type                string                      `json:"type" binding:"required,oneof=expense income transfer-in transfer-out investment other" example:"expense"`
	WalletID            uuid.UUID                   `json:"wallet_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	DestinationWalletID *uuid.UUID                  `json:"destination_wallet_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	ContactID           *uuid.UUID                  `json:"contact_id" example:"550e8400-e29b-41d4-a716-446655440002"`
	WorkspaceID         uuid.UUID                   `json:"-"`
	CreatedBy           uuid.UUID                   `json:"-"`
	Items               []TransactionItemRequestDTO `json:"items" binding:"required"`
	Tags                []string                    `json:"tags" example:"office,supplies"`
}

type UpdateTransactionRequestDTO struct {
	ID                  uuid.UUID                   `json:"id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440003"`
	Amount              float64                     `json:"amount" binding:"required" example:"25.00"`
	Date                helper.Date                   `json:"date" binding:"required" swaggertype:"string" example:"2026-01-20"`
	Description         *string                     `json:"description" example:"Stationery for the office"`
	Type                string                      `json:"type" binding:"required,oneof=expense income transfer-in transfer-out investment other" example:"expense"`
	WalletID            uuid.UUID                   `json:"wallet_id" binding:"required" example:"550e8400-e29b-41d4-a716-446655440000"`
	DestinationWalletID *uuid.UUID                  `json:"destination_wallet_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	ContactID           *uuid.UUID                  `json:"contact_id" example:"550e8400-e29b-41d4-a716-446655440002"`
	WorkspaceID         uuid.UUID                   `json:"-"`
	CreatedBy           uuid.UUID                   `json:"-"`
	Items               []TransactionItemRequestDTO `json:"items" binding:"required"`
	Tags                []string                    `json:"tags" example:"office,supplies"`
}

type TransactionItemResponseDTO struct {
	ID           string  `json:"id" example:"550e8400-e29b-41d4-a716-446655440004"`
	Name         string  `json:"name" example:"Office supplies"`
	Quantity     float64 `json:"quantity" example:"2"`
	Price        float64 `json:"price" example:"12.50"`
	Total        float64 `json:"total" example:"25.00"`
	TransactionID string  `json:"-"`
}

type TransactionWalletResponseDTO struct {
	ID   string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name string `json:"name" example:"Cash"`
}

type TransactionContactResponseDTO struct {
	ID   string `json:"id" example:"550e8400-e29b-41d4-a716-446655440002"`
	Name string `json:"name" example:"John Doe"`
}

type TransactionTagResponseDTO struct {
	ID   string `json:"id" example:"550e8400-e29b-41d4-a716-446655440000"`
	Name string `json:"name" example:"Office"`
}

type TransactionResponseDTO struct {
	ID                  string                       `json:"id" example:"550e8400-e29b-41d4-a716-446655440003"`
	Amount              float64                      `json:"amount" example:"25.00"`
	Date                time.Time                    `json:"date" example:"2026-01-20"`
	Description         *string                      `json:"description" example:"Stationery for the office"`
	Type                string                       `json:"type" example:"expense"`
	WalletID            uuid.UUID                    `json:"wallet_id" example:"550e8400-e29b-41d4-a716-446655440000"`
	DestinationWalletID *uuid.UUID                   `json:"destination_wallet_id" example:"550e8400-e29b-41d4-a716-446655440001"`
	ContactID           *uuid.UUID                   `json:"contact_id" example:"550e8400-e29b-41d4-a716-446655440002"`
	WorkspaceID         uuid.UUID                    `json:"-"`
	CreatedBy           uuid.UUID                    `json:"-"`
	Wallet              TransactionWalletResponseDTO   `json:"wallet"`
	Contact             TransactionContactResponseDTO  `json:"contact"`
	Items               []TransactionItemResponseDTO `json:"items"`
	Tags                []TransactionTagResponseDTO  `json:"tags" example:"office,supplies"`
}
