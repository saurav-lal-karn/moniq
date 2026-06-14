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
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
	ErrExpiredToken = errors.New("token has expired")
	ErrInvalidUUID = errors.New("Invalid UUID")

	UserIdNotFoundInContext = errors.New("User Id not found in context. Please try again")
	EmailNotFoundInContext = errors.New("Email not found in context. Please try again")
	RoleNotFoundInContext = errors.New("Role not found in context. Please try again")
	
	ValueNotFound = errors.New("Value not found")
)