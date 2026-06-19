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
