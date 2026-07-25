package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type TransactionType string

const (
	Expense TransactionType = "expense"
	Income TransactionType = "income"
	TransferIn TransactionType = "transfer-in"
	TransferOut TransactionType = "transfer-out"
	Investment TransactionType = "investment"
	Other TransactionType = "other"
)

type Transaction struct {
	model.BaseModel

	Amount float64
	Date time.Time
	Description *string
	Type TransactionType

	WalletID uuid.UUID
	ContactID *uuid.UUID
	WorkspaceID uuid.UUID
	CreatedBy uuid.UUID
}

type LedgerEntryDirection string
const (
	DebitDirection LedgerEntryDirection = "debit"
	CreditDirection LedgerEntryDirection = "credit"
)

type LedgerEntry struct {
	model.BaseModel
	Amount float64
	Date time.Time
	Description *string
	Direction LedgerEntryDirection

	TransactionID uuid.UUID
	WalletID uuid.UUID
	WorkspaceID uuid.UUID
	CreatedBy uuid.UUID
	TransferGroupID uuid.UUID
}

type TransactionItem struct {
	model.BaseModel
	Name string
	Quantity int64
	Price float64
	Total float64

	TransactionID uuid.UUID
	CreatedBy uuid.UUID
}