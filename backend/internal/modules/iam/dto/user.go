package dto

import (
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/iam/model"
)

type CreateUserRequestDTO struct {
	FirstName string `json:"first_name" validate:"required" example:"Jane"`
	LastName  string `json:"last_name" validate:"required" example:"Doe"`
	Email     string `json:"email" validate:"required,email" example:"jane@example.test"`
	Password  string `json:"password" validate:"required,min=8" example:"password123"`
}

func (dto *CreateUserRequestDTO) ToModel() *model.User {
	return &model.User{
		FirstName: dto.FirstName,
		LastName:  helper.StringPtr(dto.LastName),
		Email:     dto.Email,
	}
}

type CreateUserResponseDTO struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
}

type UserResponse struct {
	ID                string  `json:"id"`
	FirstName         string  `json:"first_name"`
	LastName          *string `json:"last_name,omitempty"`
	Email             string  `json:"email"`
	Role              string  `json:"role"`
	IsActive          bool    `json:"is_active"`
	ProfilePictureUrl *string `json:"profile_picture_url,omitempty"`
}

type UpdateUserRequestDTO struct {
	FirstName *string `json:"first_name,omitempty" example:"Jane"`
	LastName  *string `json:"last_name,omitempty" example:"Doe"`
	Email     *string `json:"email,omitempty" validate:"omitempty,email" example:"jane@example.test"`
	Role      *string `json:"role,omitempty" example:"member"`
	IsActive  *bool   `json:"is_active,omitempty" example:"true"`
}

type UpdateUserResponseDTO struct {
	ID                string  `json:"id"`
	FirstName         string  `json:"first_name"`
	LastName          *string `json:"last_name,omitempty"`
	Email             string  `json:"email"`
	Role              string  `json:"role"`
	IsActive          bool    `json:"is_active"`
	ProfilePictureUrl *string `json:"profile_picture_url,omitempty"`
}
