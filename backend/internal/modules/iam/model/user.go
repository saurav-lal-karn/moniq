package model

import (
	"time"

	"github.com/google/uuid"
)

type UserRole string
const (
	GlobalAdminRole UserRole = "super_admin"
	GlobalUserRole UserRole = "user"
)

type User struct {
	ID       uuid.UUID
	FirstName string
	LastName  *string
	Email    string
	EmailVerified bool
	ProfilePictureURL *string
	IsActive bool
	Role UserRole
	CreatedAt time.Time
	UpdatedAt time.Time
}