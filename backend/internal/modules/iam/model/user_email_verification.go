package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type UserEmailVerification struct {
	model.BaseModel

	UserID uuid.UUID
	Token string
	ExpiresAt time.Time
}