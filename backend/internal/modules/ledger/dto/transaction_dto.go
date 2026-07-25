package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
)

type TransactionItemRequestDTO struct {
	Name	string	`json:"name" binding:"required"`
	Quantity	float64	`json:"quantity" binding:"required"`
	Price	float64	`json:"price" binding:"required"`
	Total	float64	`json:"total" binding:"required"`
}

type CreateTransactionRequestDTO struct {
	Amount	float64	`json:"amount" binding:"required"`
	Date	helper.Date	`json:"date" binding:"required"`
	Description	*string	`json:"description"`
	Type	string	`json:"type" binding:"required,oneof=expense income transfer-in transfer-out investment other"`
	WalletID	uuid.UUID	`json:"wallet_id" binding:"required"`
	DestinationWalletID *uuid.UUID `json:"destination_wallet_id"`
	ContactID	*uuid.UUID	`json:"contact_id"`
	WorkspaceID	uuid.UUID	`json:"-"`
	CreatedBy	uuid.UUID	`json:"-"`
	Items	[]TransactionItemRequestDTO	`json:"items" binding:"required"`
}

type UpdateTransactionRequestDTO struct {
	ID	string	`json:"id" binding:"required"`
	Amount	float64	`json:"amount" binding:"required"`
	Date	time.Time	`json:"date" binding:"required"`
	Description	*string	`json:"description"`
	Type	string	`json:"type" binding:"required,oneof=expense income transfer-in transfer-out investment other"`
	WalletID	uuid.UUID	`json:"wallet_id" binding:"required"`
	DestinationWalletID *uuid.UUID `json:"destination_wallet_id"`
	ContactID	*uuid.UUID	`json:"contact_id"`
	WorkspaceID	uuid.UUID	`json:"-"`
	CreatedBy	uuid.UUID	`json:"-"`
	Items	[]TransactionItemRequestDTO	`json:"items" binding:"required"`
}
