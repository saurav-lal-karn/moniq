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

func ToWorkspaceMemberResponse(member *model.WorkspaceDetailsMember) dto.WorkspaceMemberResponse {
	return dto.WorkspaceMemberResponse{
		ID: member.ID,
		Role: member.Role,
		UserID: member.UserID,
		CreatedBy: member.CreatedBy,
		JoinedAt: member.JoinedAt,
		User: dto.WorkspaceMemberDetailsResponse{
			ID: member.User.ID,
			FirstName: member.User.FirstName,
			LastName: member.User.LastName,
			Email: member.User.Email,
			EmailVerified: member.User.EmailVerified,
			ProfilePictureUrl: member.User.ProfilePictureURL,
			IsActive: member.User.IsActive,
			Role: string(member.User.Role),
		},
	}
}

func ToWorkspaceDetailsReponse(workspace *model.WorkspaceDetails) dto.WorkspaceDetailsResponse {
	memberDetails := make([]dto.WorkspaceMemberResponse, 0, len(workspace.Members))
	members := &workspace.Members
	for _, member := range *members {
		memberDetails = append(memberDetails, ToWorkspaceMemberResponse(&member))
	}

	return dto.WorkspaceDetailsResponse{
		ID: workspace.ID,
		Name: workspace.Name,
		Description: workspace.Description,
		Type: workspace.Type,
		OwnerID: workspace.CreatedBy,
		Members: memberDetails,
	}
}

func ToInvitationResponse(invitationModel *model.Invitation) dto.InvitationResponseDTO {
	return dto.InvitationResponseDTO{
		ID: invitationModel.ID,
		WorkspaceID: invitationModel.WorkspaceID,
		UserID: invitationModel.UserID,
		Email: invitationModel.Email,
		Role: string(invitationModel.Role),
		ExpiresAt: invitationModel.ExpiresAt,
		InvitedBy: invitationModel.InvitedBy,
		Status: string(invitationModel.Status),
		AcceptedAt: invitationModel.AcceptedAt,
	}
}

func ToInvitationResponseList(invitations []*model.Invitation) []dto.InvitationResponseDTO{
	result := make([]dto.InvitationResponseDTO, 0, len(invitations)) 
	
	for _, invitation := range invitations {
		result = append(result, ToInvitationResponse(invitation))
	}
	return result
}