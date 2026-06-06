package model

import (
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper/model"
)

type ContactType string
const (
	LenderContact ContactType = "lender"
	EmployeeContact ContactType = "employee"
	ClientContact ContactType = "client"
	VendorContact ContactType = "vendor"
	OtherContact ContactType = "other"
)

type Contact struct {
	model.BaseModel

	Name string
	Email *string
	Phone *string
	Address *string
	Type ContactType
	WorkspaceID uuid.UUID
	CreatedBy uuid.UUID
}