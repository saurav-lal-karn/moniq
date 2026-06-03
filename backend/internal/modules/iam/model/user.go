package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID       uuid.UUID `db:"id" json:"id"`
	FirstName string `db:"first_name" json:"firstName"`
	LastName  *string `db:"last_name" json:"lastName,omitempty"`
	Email    string `db:"email" json:"email"`
	EmailVerified bool `db:"email_verified" json:"emailVerified"`
	ProfilePictureURL *string `db:"profile_picture_url" json:"profilePictureURL"`
	IsActive bool `db:"is_active" json:"isActive"`
	Role string `db:"role" json:"role"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}