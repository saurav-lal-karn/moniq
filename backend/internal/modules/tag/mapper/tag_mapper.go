package mapper

import (
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/model"
)

func ToTagResponse(tag *model.Tag) dto.TagResponseDTO {
	return dto.TagResponseDTO{
		ID:          tag.ID.String(),
		Name:        tag.Name,
		WorkspaceID: tag.WorkspaceID,
		CreatedBy:   tag.CreatedBy,
	}
}

func ToTagResponseList(tags []*model.Tag) []dto.TagResponseDTO {
	result := make([]dto.TagResponseDTO, 0, len(tags))
	for _, tag := range tags {
		result = append(result, ToTagResponse(tag))
	}
	return result
}
