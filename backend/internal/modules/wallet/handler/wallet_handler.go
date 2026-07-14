package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/saurav-lal-karn/moniq/backend/internal/helper"
	"github.com/saurav-lal-karn/moniq/backend/internal/modules/wallet/dto"
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

