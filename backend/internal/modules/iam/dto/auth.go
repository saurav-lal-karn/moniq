package dto

type RegisterRequestDTO struct {
	FirstName string `json:"first_name" binding:"required" example:"Jane"`
	LastName  string `json:"last_name" binding:"required" example:"Doe"`
	Email     string `json:"email" binding:"required,email" example:"jane@example.test"`
	Password  string `json:"password" binding:"required,min=8" example:"password123"`
}

type LoginRequestDTO struct {
	Email    string `json:"email" binding:"required,email" example:"saurav@gmail.com"`
	Password string `json:"password" binding:"required" example:"password"`
}

type LoginResponseDTO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type LogoutRequestDTO struct {
	RefreshToken string `json:"refresh_token" binding:"required" example:"refresh-token"`
}

type RefreshRequestDTO struct {
	RefreshToken string `json:"refresh_token" binding:"required" example:"refresh-token"`
}

type RefreshResponseDTO struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
