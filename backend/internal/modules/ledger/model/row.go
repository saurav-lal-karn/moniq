package model

import (
	"time"

	"github.com/google/uuid"
	contactModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/model"
	walletModel "github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/model"
)

type TransactionRow struct {
	TransactionID string
	TransactionAmount float64
	TransactionDate time.Time
	TransactionDescription *string
	TransactionType string
	TransactionWalletID uuid.UUID
	TransactionContactID uuid.UUID
	TransactionWorkspaceID uuid.UUID
	TransactionCreatedBy uuid.UUID

	TransactionItemID string
	TransactionItemName string
	TransactionItemQuantity float64
	TransactionItemPrice float64
	TransactionItemTotal float64
}

type TransactionItemDetails struct {
	ID		string
	Name		string
	Quantity	float64
	Price		float64
	Total		float64
}

type TransactionTag struct {
	ID 		string
	Name	string
}

type TransactionDetails struct {
	ID 				string
	Amount			float64
	Date			time.Time
	Description		*string
	Type			string
	WalletID		uuid.UUID
	ContactID		uuid.UUID
	WorkspaceID		uuid.UUID
	CreatedBy		uuid.UUID

	Wallet		walletModel.Wallet
	Contact		contactModel.Contact

	Items []TransactionItemDetails
	Tags []TransactionTag
}