package model

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type AuthIdentifier struct {
	model.BaseModel

	UserID uuid.UUID
	PasswordHash *string
	RefreshTokenHash *string
	AuthProvider string
	AuthProviderUserID string
}