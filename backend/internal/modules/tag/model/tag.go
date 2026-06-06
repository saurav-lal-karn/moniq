package model

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type Tag struct {
	model.BaseModel
	Name string
	WorkspaceID *uuid.UUID
	CreatedBy *uuid.UUID
}

type TransactionTag struct {
	TransactionID uuid.UUID
	TagID uuid.UUID
}