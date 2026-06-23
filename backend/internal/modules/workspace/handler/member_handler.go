package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/workspace/service"
)

type memberHandler struct {
	service service.MemberService
}

func NewMemberHandler(service service.MemberService) *memberHandler{
	return &memberHandler{
		service: service,
	}
}

// Add member in workspace godoc
// 
// @Summary Add member in workspace
// @Description Add member to workspace
// @Tags WorkspaceMember
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Workspace Id"
// @Param request body dto.CreateWorkspaceMemberDTO true "CreateWorkspace Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/{id}/member [post]
func(h *memberHandler) CreateMember(ctx *gin.Context){
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

	workspaceId := ctx.Param("id")
	if workspaceId == ""{
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}
	
	var req dto.CreateWorkspaceMemberDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}
	req.CreatedBY = userID
	req.WorkspaceID = workspaceID

	err = h.service.CreateMember(ctx, req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Member created successfully", nil)
}