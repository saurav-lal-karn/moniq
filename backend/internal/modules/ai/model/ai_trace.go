package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type AITrace struct {
	ID uuid.UUID
	WorkspaceID uuid.UUID
	UserID uuid.UUID
	Input json.RawMessage
	Output *json.RawMessage
	ModelVersion *string
	InputTokens *int
	OutputTokens *int
	LatencyMs *int

	CreatedAt time.Time
}