package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/dto"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/mapper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/service"
)

type walletTypeHandler struct {
	service service.WalletTypeService
}

func NewWalletTypeHandler(service service.WalletTypeService) *walletTypeHandler {
	return &walletTypeHandler{
		service: service,
	}
}

// List Wallet Type godoc
// 
// @Summary List Wallet Type
// @Description List of wallet types
// @Tags Wallet Type
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param X-Workspace-Id header string true "Workspace ID"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet-type [get]
func(h *walletTypeHandler) ListAll(ctx *gin.Context) {	
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

	data, err := h.service.ListAll(ctx, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToWalletTypeResponseList(data)
	helper.SuccessResponse(ctx, http.StatusOK, "WalletTypes fetched successfully", response)
}

// Create wallet type in workspace godoc
// 
// @Summary create wallet type in workspace
// @Description create wallet type in workspace
// @Tags Wallet Type
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateWalletTypeRequestDTO true "Create Wallet Type Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet-type [post]
func(h *walletTypeHandler) Create(ctx *gin.Context) {

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

	var req dto.CreateWalletTypeRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}
	req.WorkspaceID = workspaceID
	req.CreatedBy = userID

	if err := h.service.Create(ctx, &req); err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}
	helper.SuccessResponse(ctx, http.StatusOK, "WalletType created successfully", nil)
}

// Delete Wallet Type godoc
// 
// @Summary Delete wallet type
// @Description Delete Wallet Type
// @Tags Wallet Type
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Wallet Type Id"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet-type/{id} [delete]
func(h *walletTypeHandler) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Invalid WalletType ID")
		return
	}
	
	idUUID, err := uuid.Parse(id)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Invalid WalletType ID")
		return
	}
	
	if err := h.service.Delete(ctx, idUUID); err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "WalletType deleted successfully", nil)
}