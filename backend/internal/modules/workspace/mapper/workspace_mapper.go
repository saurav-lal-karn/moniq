package mapper

import (
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/model"
)

func ToWorkspaceResponse(workspaceModel *model.Workspace) dto.WorkspaceResponseDTO {
	return dto.WorkspaceResponseDTO{
		ID: workspaceModel.ID.String(),
		Name: workspaceModel.Name,
		Description: helper.StringValue(workspaceModel.Description),
		Type: string(workspaceModel.Type),
		OwnerID: workspaceModel.CreatedBy.String(),
	}
}

func ToWorkspaceResponseList(workspaces []*model.Workspace) []dto.WorkspaceResponseDTO{
	result := make([]dto.WorkspaceResponseDTO, 0, len(workspaces)) 
	
	for _, workspace := range workspaces {
		result = append(result, ToWorkspaceResponse(workspace))
	}
	return result
}