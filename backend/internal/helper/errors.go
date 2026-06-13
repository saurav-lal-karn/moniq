package helper

import "errors"

var (
	ErrUserNotFound          = errors.New("user not found")
	ErrEmailAlreadyExists    = errors.New("email already exists")
	ErrUsernameAlreadyExists = errors.New("username already exists")
	ErrEmailNotVerified = errors.New("Email has not verified. Please verify before login.")
	ErrUserNotActive = errors.New("You don't have access to the account. Please contact the admin.")
	ErrInvalidCredentials = errors.New("Invalid email or password. Please check and try again")
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)