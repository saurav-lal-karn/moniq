package dto

type LoginRequestDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponseDTO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RegisterRequestDTO struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
}

type RegisterResponseDTO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RefreshTokenRequestDTO struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type RefreshTokenResponseDTO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type LogoutRequestDTO struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type LogoutResponseDTO struct {
	Message string `json:"message"`
}

type ForgotPasswordRequestDTO struct {
	Email string `json:"email" validate:"required,email"`
}

type ForgotPasswordResponseDTO struct {
	Message string `json:"message"`
}

type ResetPasswordRequestDTO struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type ResetPasswordResponseDTO struct {
	Message string `json:"message"`
}