package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type UserSession struct {
	model.BaseModel
	
	UserID uuid.UUID
	RefreshTokenHash string
	DeviceName *string
	IPAddress *string
	UserAgent *string
	ExpiresAt time.Time
	RevokedAt *time.Time
}