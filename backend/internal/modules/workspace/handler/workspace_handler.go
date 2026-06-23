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

type workspaceHandler struct {
	service service.WorkspaceService
}

func NewWorkspaceHandler(service service.WorkspaceService) *workspaceHandler {
	return &workspaceHandler{
		service: service,
	}
}

// Create Workspace godoc
// 
// @Summary Create workspace
// @Description Create workspace
// @Tags Workspace
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateWorkspaceRequestDTO true "CreateWorkspace Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/create [post]
func (h *workspaceHandler) CreateWorkspace(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, "Invalid user ID type")
		return
	}

	userId, err := uuid.Parse(userIDStr)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid user ID in the request")
		return
	}

	var req dto.CreateWorkspaceRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	// Add owner Id in request payload
	req.OwnerID = userId
	createdWorkspace, err := h.service.Create(ctx, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "workspace created", createdWorkspace)
}

// List Workspace godoc
// 
// @Summary List My Workspace
// @Description List of user's workspaces
// @Tags Workspace
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/list [get]
func (h *workspaceHandler) ListMyWorkspaces(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userIDStr, ok := userID.(string)
	if !ok {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, "Invalid user ID type")
		return
	}

	workspaces, err := h.service.ListMyWorkspaces(ctx, userIDStr)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	workspacesResponse := mapper.ToWorkspaceResponseList(workspaces)
	helper.SuccessResponse(ctx, http.StatusOK, "Workspace listed successfully", workspacesResponse)
}

// Get Workspace details godoc
// 
// @Summary Get workspace details
// @Description Get Workspace details
// @Tags Workspace
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Workspace Id"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/details/{id} [get]
func(h *workspaceHandler) GetWorkspaceDetails(ctx *gin.Context) {
	workspaceId := ctx.Param("id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	details, err := h.service.GetWorkspaceDetails(ctx, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	workspaceDetailsReponse := mapper.ToWorkspaceDetailsReponse(details)
	helper.SuccessResponse(ctx, http.StatusOK, "Details fetched successfully", workspaceDetailsReponse)
}


// Update Workspace godoc
// 
// @Summary Update workspace
// @Description Update Workspace
// @Tags Workspace
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Workspace Id"
// @Param request body dto.UpdateWorkspaceRequestDTO true "Updated workspace details"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/{id} [put]
func(h *workspaceHandler) UpdateWorkspace(ctx *gin.Context) {
	workspaceId := ctx.Param("id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.UpdateWorkspaceRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	updatedWorkspaceDetails, err := h.service.UpdateWorkspaceDetails(ctx, workspaceID, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	updatedResponse := mapper.ToWorkspaceResponse(updatedWorkspaceDetails)
	helper.SuccessResponse(ctx, http.StatusOK, "Workspace details updated successfully", updatedResponse)
}


// Delete Workspace godoc
// 
// @Summary Delete workspace
// @Description Delete Workspace
// @Tags Workspace
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Workspace Id"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/{id} [delete]
func(h *workspaceHandler) DeleteWorkspace(ctx *gin.Context) {
	userId, exists := ctx.Get("userID")
	if !exists {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "User ID not found in context")
		return
	}

	userID, err := uuid.Parse(userId.(string))
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusUnauthorized, "Invalid User ID, Please try again")
		return
	}

	workspaceId := ctx.Param("id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	err = h.service.DeleteWorkspace(ctx, workspaceID, userID)
	if  err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Workspace deleted successfully", nil)
}