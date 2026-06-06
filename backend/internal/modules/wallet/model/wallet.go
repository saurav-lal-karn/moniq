package model

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type Wallet struct {
	model.BaseModel
	Name string
	Description *string
	Currency string
	TypeID uuid.UUID
	WorkspaceID uuid.UUID
	CreatedBy uuid.UUID
}

type WalletType struct {
	model.BaseModel
	Name string
	Description *string
	WorkspaceID *uuid.UUID
	CreatedBy *uuid.UUID
}