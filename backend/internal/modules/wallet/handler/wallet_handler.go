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

type walletHandler struct {
	walletService service.WalletService
}

func NewWalletHandler(walletService service.WalletService) *walletHandler {
	return &walletHandler{
		walletService: walletService,
	}
}

// Create wallet in workspace godoc
// 
// @Summary create wallet in workspace
// @Description create wallet in workspace
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param request body dto.CreateWalletRequestDTO true "Create Wallet Request"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet [post]
func (h *walletHandler) CreateWallet(ctx *gin.Context) {
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

	var req dto.CreateWalletRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.WorkspaceID = workspaceID
	req.CreatedBy = userID

	err = h.walletService.CreateWallet(ctx, &req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Wallet created successfully", nil)
}

// List Wallets godoc
// 
// @Summary List Wallets
// @Description List of wallets
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Success 201 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet [get]
func (h *walletHandler) ListAll(ctx *gin.Context) {
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

	data, err := h.walletService.List(ctx, userID, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToWalletResponseList(data)

	helper.SuccessResponse(ctx, http.StatusOK, "Wallets fetched successfully", response)
}

// Get Wallet details godoc
// 
// @Summary Get wallet details
// @Description Get wallet details
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Wallet Id"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet/{id} [get]
func (h *walletHandler) GetByID(ctx *gin.Context) {
	walletId := ctx.Param("id")
	
	if walletId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Wallet ID not found in request. Please try again")
		return
	}
	
	walletID, err := uuid.Parse(walletId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed wallet ID in request. Please check again")
		return
	}
	
	wallet, err := h.walletService.GetByID(ctx, walletID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	response := mapper.ToWalletResponse(wallet)
	
	helper.SuccessResponse(ctx, http.StatusOK, "Wallet details fetched successfully", response)
}

// Update wallet godoc
// 
// @Summary Update wallet
// @Description Update wallet
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Wallet Id"
// @Param request body dto.UpdateWalletRequestDTO true "Updated wallet details"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet/{id} [put]
func (h *walletHandler) UpdateWallet(ctx *gin.Context) {
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

	walletId := ctx.Param("id")
	if walletId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Wallet ID not found in request. Please try again")
		return
	}

	walletID, err := uuid.Parse(walletId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed wallet ID in request. Please check again")
		return
	}

	var req dto.UpdateWalletRequestDTO
	if err := ctx.ShouldBindJSON(&req); err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, helper.FormatValidationError(err))
		return
	}

	req.ID = walletID
	req.WorkspaceID = workspaceID
	req.CreatedBy = userID

	err = h.walletService.Update(ctx, userID, workspaceID, &req)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Wallet updated successfully", nil)
}

// Delete Wallet godoc
// 
// @Summary Delete Wallet
// @Description Delete Wallet
// @Tags Wallet
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param x-workspace-id header string true "Workspace ID"
// @Param id path string true "Wallet Id"
// @Success 200 {object} helper.Response
// @Failure 400 {object} helper.Response
// @Router /wallet/{id} [delete]
func(h *walletHandler) DeleteWallet(ctx *gin.Context) {
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

	walletId := ctx.Param("id")
	if walletId == "" {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Wallet ID not found in request. Please try again")
		return
	}

	walletID, err := uuid.Parse(walletId)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusBadRequest, "Malformed wallet ID in request. Please check again")
		return
	}

	err = h.walletService.Delete(ctx, walletID, userID, workspaceID)
	if err != nil {
		helper.ErrorResponse(ctx, http.StatusInternalServerError, err.Error())
		return
	}

	helper.SuccessResponse(ctx, http.StatusOK, "Wallet deleted successfully", nil)
}