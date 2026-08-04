package dto

import "github.com/google/uuid"

type CreateTagRequestDTO struct {
	Name        string     `json:"name" binding:"required" example:"Utilities"`
	WorkspaceID *uuid.UUID `json:"-"`
}

type UpdateTagRequestDTO struct {
	Name string `json:"name" binding:"required" example:"Utilities"`
}

type TagResponseDTO struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	WorkspaceID *uuid.UUID `json:"workspace_id"`
	CreatedBy   *uuid.UUID `json:"created_by"`
}
