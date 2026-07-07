package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/mapper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
)

type inviteHandler struct {
	service service.InviteService
}

func NewInviteHandler(service service.InviteService) *inviteHandler {
	return &inviteHandler{
		service: service,
	}
}

// Invite member in workspace godoc
// 
// @Summary invite to workspace
// @Description invite a person to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.InviteUserToWorkspaceDTO true "Invite User To Workspace Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/invite [post]
func(i *inviteHandler) InviteUserToWorkspace(ctx *gin.Context) {
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}
	
	var req dto.InviteUserToWorkspaceDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}
	// Add the workspace id and user_id to dto
	req.WorkspaceID = workspaceID
	req.InvitedBy = userID

	err = i.service.InviteUserToWorkspace(ctx, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "User invited to workspace successfully", nil)
}

// List invitations in workspace godoc
// 
// @Summary list invitations to workspace
// @Description list invitations to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/invite [get]
func(i *inviteHandler) GetInvitationList(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	invitations, err := i.service.ListInvitations(ctx, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToInvitationResponseList(invitations)
	helper.SuccessResponse(ctx, http.StatusOK, "Invitations listed successfully", response)
}

// GetInvitationDetails godoc
// 
// @Summary get invitation details
// @Description get invitation details by token
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Param token query string true "Token"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invitation/details [get]
func(i *inviteHandler) GetInvitationDetails(ctx *gin.Context){
	token := ctx.Query("token")
	if token == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Token is required")
		return
	}

	details, err := i.service.GetInvitationDetailsByToken(ctx, token)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}
	helper.SuccessResponse(ctx, http.StatusOK, "Invitation details retrieved successfully.", details)
}

// Accept invite godoc
// 
// @Summary accept invite to workspace
// @Description accept inviteto workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.AcceptDeclineInvitationDTO true "Accept invitation Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invitation/accept [post]
func(i *inviteHandler) AcceptInvitation(ctx *gin.Context){
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}
	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	email, exists := ctx.Get("email")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User email not found in context")
		return
	}

	var req dto.AcceptDeclineInvitationDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	err = i.service.AcceptInviteToWorkspace(ctx, req.Token, userID, email.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}
	helper.SuccessResponse(ctx, http.StatusOK, "Invitation accepted successfully.", nil)
}

// Decline invite godoc
// 
// @Summary decline invite to workspace
// @Description decline invite to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.AcceptDeclineInvitationDTO true "Decline invitation Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invitation/decline [post]
func(i *inviteHandler) DeclineInvitation(ctx *gin.Context){
	email, exists := ctx.Get("email")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User email not found in context")
		return
	}

	var req dto.AcceptDeclineInvitationDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	err := i.service.DeclineInviteToWorkspace(ctx, req.Token, email.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Invitation declined successfully.", nil)
}

// Revoke invitation godoc
// 
// @Summary revoke invitation to workspace
// @Description revoke invitation to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.RevokeInvitationDTO true "Revoke invitation Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invitation/revoke [post]
func(i *inviteHandler) RevokeInvitation(ctx *gin.Context){
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.RevokeInvitationDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	err = i.service.RevokeInvite(ctx, req.ID, userID, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Invitation revoked successfully.", nil)
}

// Resend invitation godoc
// 
// @Summary resend invitation to workspace
// @Description resend invitation to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.ResendInvitationDTO true "Resend Invite User To Workspace Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invite/resend [post]
func(i *inviteHandler) ResendInvitation(ctx *gin.Context){
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}
	
	var req dto.ResendInvitationDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}
	// Add the workspace id and user_id to dto
	req.WorkspaceID = workspaceID
	req.InvitedBy = userID

	err = i.service.ResendInvitation(ctx, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "User invited to workspace successfully", nil)
}

// Remove invitation godoc
// 
// @Summary remove invitation to workspace
// @Description remove invitation to workspace
// @Tags WorkspaceInvitation
// @Accept json
// @Produce json
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.RemoveInvitationDTO true "Remove invitation Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /invitation/revoke [post]
func(i *inviteHandler) RemoveInvitation(ctx *gin.Context){
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.RemoveInvitationDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	err = i.service.RemoveInvite(ctx, req.ID, userID, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Invitation removed successfully.", nil)
}
