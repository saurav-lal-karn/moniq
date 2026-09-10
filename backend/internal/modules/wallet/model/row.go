package model

import (
	"time"

	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type WalletLedgerDetails struct {
	ID            string
	Amount        float64
	Date          time.Time
	Description   *string
	Direction     string
	TransactionID string `json:"transaction_id"`
}

type WalletTypeDetails struct {
	ID   string
	Name string
}

type WalletDetails struct {
	ID          string
	Name        string
	Description *string
	Currency    string
	TypeID      string
	WorkspaceID string
	CreatedBy   string
	CreatedAt   time.Time `json:"created_at"`
	
	Type        WalletTypeDetails          `json:"wallet_type"`

	User        model.BaseCreatedByDetails `json:"user"`
	LedgerEntries []WalletLedgerDetails `json:"ledger_entries"`
}
