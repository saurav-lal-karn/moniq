package dto

import "github.com/google/uuid"

type CreateTagRequestDTO struct {
	Name        string     `json:"name" validate:"required"`
	WorkspaceID *uuid.UUID `json:"workspaceId"`
}

type UpdateTagRequestDTO struct {
	Name string `json:"name"`
}
