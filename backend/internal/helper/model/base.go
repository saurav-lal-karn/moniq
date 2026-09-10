package model

import (
	"time"

	"github.com/google/uuid"
)

type BaseModel struct {
	ID        uuid.UUID
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}

type BaseCreatedByDetails struct {
	ID                uuid.UUID `json:"id" db:"id"`
	FirstName         string    `json:"first_name" db:"first_name"`
	LastName          *string   `json:"last_name" db:"last_name"`
	Email             string    `json:"email" db:"email"`
	ProfilePictureURL *string   `json:"profile_picture_url" db:"profile_picture_url"`
}
