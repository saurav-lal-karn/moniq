package user

import (
	"context"
	"time"
)

// User represents the domain model for a user in Moniq.
type User struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// SignUpRequest holds the payload required for registering a new user.
type SignUpRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=72"`
}

// LoginRequest holds the payload required for user authentication.
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserResponse holds the user data safe for public/HTTP response.
type UserResponse struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserRepository defines the database persistence operations required for Users.
type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
}

// UserService defines the business logic operations required for Users.
type UserService interface {
	Register(ctx context.Context, req SignUpRequest) (*UserResponse, string, error)
	Login(ctx context.Context, req LoginRequest) (string, error)
	GetProfile(ctx context.Context, userID string) (*UserResponse, error)
}
