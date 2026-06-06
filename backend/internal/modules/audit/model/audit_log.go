package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type AuditLog struct {
	ID uuid.UUID
	WorkspaceID uuid.UUID
	UserID uuid.UUID
	Action string
	Entity string
	EntityID *uuid.UUID
	OldData *json.RawMessage
	NewData *json.RawMessage

	CreatedAt time.Time
}