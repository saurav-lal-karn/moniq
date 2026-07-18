package mapper

import (
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/contact/model"
)

func ToContactResponse(contact *model.Contact) dto.ContactResponseDTO {
	return dto.ContactResponseDTO{
		ID:          contact.ID.String(),
		Name:        contact.Name,
		Email:       contact.Email,
		Phone:       contact.Phone,
		Address:     contact.Address,
		Type:        string(contact.Type),
		WorkspaceID: contact.WorkspaceID,
		CreatedBy:   contact.CreatedBy,
	}
}

func ToContactResponseList(contacts []*model.Contact) []dto.ContactResponseDTO {
	result := make([]dto.ContactResponseDTO, 0, len(contacts))
	for _, contact := range contacts {
		result = append(result, ToContactResponse(contact))
	}
	return result
}
