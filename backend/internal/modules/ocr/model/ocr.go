package model

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type Attachment struct {
	model.BaseModel
	FileUrl string
	FileType string
	FileSize int64

	TransactionID uuid.UUID
	CreatedBy uuid.UUID
}

type AttachmentOCR struct {
	model.BaseModel
	AttachmentID uuid.UUID
	RawText *string
	Language *string
	ExtractedData json.RawMessage
	ConfidenceScore *float64
	ModelVersion *string
}