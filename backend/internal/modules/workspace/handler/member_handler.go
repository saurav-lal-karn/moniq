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
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateWorkspaceMemberDTO true "CreateWorkspace Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/member [post]
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

// List members in workspace godoc
// 
// @Summary List members in workspace
// @Description List members of workspace
// @Tags WorkspaceMember
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /workspace/member [get]
func(h *memberHandler) ListMembers(ctx *gin.Context) {
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

	members, err := h.service.ListMembers(ctx, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToWorkspaceMemberListReponse(members)
	helper.SuccessResponse(ctx, http.StatusOK, "Members listed successfully", response)
}