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
	ErrUnauthorized = errors.New("You don't have permission to perform this action. Please contact the administrator")

	UserIdNotFoundInContext = errors.New("User Id not found in context. Please try again")
	EmailNotFoundInContext = errors.New("Email not found in context. Please try again")
	RoleNotFoundInContext = errors.New("Role not found in context. Please try again")
	
	ValueNotFound = errors.New("Value not found")
	ErrWalletTypeNotFound = errors.New("Wallet Type not found. Please try again")
	ErrWalletNotFound = errors.New("Wallet not found. Please try again")

	ErrTagNotFound = errors.New("Tag not found. Please try again")
	ErrContactNotFound = errors.New("Contact not found. Please try again")
	ErrTransactionNotFound = errors.New("Transaction not found. Please try again")
	ErrDestinationWalletIDRequired = errors.New("Destination wallet ID is required for this transaction type")

	// Errors when failed to query
	ErrFailedToQueryWalletType = errors.New("Failed to query wallet type. Please try again")
	ErrFailedToQueryWallet = errors.New("Failed to query wallet. Please try again")

	// Errors when failed to update
	ErrFailedToUpdateWalletType = errors.New("Failed to update wallet type. Please try again")
	ErrFailedToUpdateWallet = errors.New("Failed to update wallet. Please try again")
)