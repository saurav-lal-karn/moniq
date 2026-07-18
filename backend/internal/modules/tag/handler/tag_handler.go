package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/mapper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/tag/service"
)

type tagHandler struct {
	tagService service.TagService
}

func NewTagHandler(tagService service.TagService) *tagHandler {
	return &tagHandler{
		tagService: tagService,
	}
}

// Create Tag godoc
//
// @Summary Create a new tag
// @Description Create a new tag in the workspace
// @Tags Tag
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateTagRequestDTO true "Create Tag Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /tag [post]
func (h *tagHandler) CreateTag(ctx *gin.Context) {
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
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	var req dto.CreateTagRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.WorkspaceID = &workspaceID

	err = h.tagService.Create(ctx, &req, &userID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusCreated, "Tag created successfully", nil)
}

// List Tags godoc
//
// @Summary List all tags
// @Description List all tags in the workspace (includes system tags)
// @Tags Tag
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /tag [get]
func (h *tagHandler) ListAll(ctx *gin.Context) {
	workspaceId := ctx.GetHeader("X-Workspace-Id")
	if workspaceId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Workspace Id not found in header. Please try again.")
		return
	}

	workspaceID, err := uuid.Parse(workspaceId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed workspace ID in request. Please check again")
		return
	}

	tags, err := h.tagService.List(ctx, &workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToTagResponseList(tags)

	helper.SuccessResponse(ctx, http.StatusOK, "Tags fetched successfully", response)
}

// Get Tag by ID godoc
//
// @Summary Get tag by ID
// @Description Get tag details by ID
// @Tags Tag
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Tag ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /tag/{id} [get]
func (h *tagHandler) GetByID(ctx *gin.Context) {
	tagId := ctx.Param("id")
	if tagId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Tag ID not found in request. Please try again")
		return
	}

	tagID, err := uuid.Parse(tagId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed tag ID in request. Please check again")
		return
	}

	tag, err := h.tagService.GetByID(ctx, tagID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToTagResponse(tag)

	helper.SuccessResponse(ctx, http.StatusOK, "Tag details fetched successfully", response)
}

// Update Tag godoc
//
// @Summary Update tag
// @Description Update tag details
// @Tags Tag
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Tag ID"
// @Param request body dto.UpdateTagRequestDTO true "Update Tag Request"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /tag/{id} [put]
func (h *tagHandler) UpdateTag(ctx *gin.Context) {
	tagId := ctx.Param("id")
	if tagId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Tag ID not found in request. Please try again")
		return
	}

	tagID, err := uuid.Parse(tagId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed tag ID in request. Please check again")
		return
	}

	var req dto.UpdateTagRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	err = h.tagService.Update(ctx, tagID, &req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Tag updated successfully", nil)
}

// Delete Tag godoc
//
// @Summary Delete tag
// @Description Delete tag by ID
// @Tags Tag
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Tag ID"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /tag/{id} [delete]
func (h *tagHandler) DeleteTag(ctx *gin.Context) {
	tagId := ctx.Param("id")
	if tagId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Tag ID not found in request. Please try again")
		return
	}

	tagID, err := uuid.Parse(tagId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed tag ID in request. Please check again")
		return
	}

	err = h.tagService.Delete(ctx, tagID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Tag deleted successfully", nil)
}
